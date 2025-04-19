import { Map as IMap } from "immutable";
import { create, StoreApi } from "zustand";
import { Artifact, FileNotFoundError, Meta } from "@artifact/api";
import { z, ZodTypeAny } from "zod";

export type SyncState = "fresh" | "stale" | "syncing";

type TreeEntry = Meta | IMap<string, TreeEntry>;

type Depth = number | true | undefined;

interface SubscriberOptions {
    /** Recursion depth for both meta + blobs. `true` ⇒ unlimited */
    depth?: Depth;
    /** Also download blob contents */
    blobs?: boolean;
}

interface InternalWatcher extends Required<SubscriberOptions> {
    count: number;
    controller: AbortController;
}

interface ReadDirOptions<R> {
    recursive?: Depth;
    transform?: (meta: Meta, raw: Uint8Array) => R;
}

interface Progress {
    synced: number;
    total: number;
}

interface SyncStore {
    /** OID of latest commit pulled so far */
    commit: string | null;
    /** Tree of `Meta` + sub‑trees */
    tree: IMap<string, TreeEntry>;
    /** Blob cache keyed by OID */
    files: IMap<string, Uint8Array>;
    /** Per‑oid sync status */
    status: IMap<string, SyncState>;

    /** Subscribe to path (meta always; blobs optional). */
    subscribePath: (path: string, opts?: SubscriberOptions) => void;
    unsubscribePath: (path: string) => void;

    /** --- synchronous access helpers --- */
    readFile: <R = Uint8Array>(
        path: string,
        transform?: (raw: Uint8Array) => R,
    ) => R | undefined;
    readDir: <R = Uint8Array>(path: string, opts?: ReadDirOptions<R>) => {
        listing: Meta[];
        read: (metaOrPath: string | Meta) => R | undefined;
        progress: Progress;
    };

    /** One‑shot fetch that always hits the server. */
    oneOffRead: <R = Uint8Array>(
        path: string,
        transform?: (raw: Uint8Array) => R,
    ) => Promise<R>;

    /** Suspense‑compatible promise (throws when missing). */
    awaitFile: <R = Uint8Array>(
        path: string,
        transform?: (raw: Uint8Array) => R,
    ) => Promise<R>;

    /** Internal selectors */
    getMeta: (path: string) => Meta | undefined;
    isSynced: (path: string) => boolean;
}

/* -------------------------------------------------- */
/* helpers                                            */
/* -------------------------------------------------- */
const split = (p: string) => p.split("/").filter(Boolean);

const insertMeta = (
    t: IMap<string, TreeEntry>,
    parts: string[],
    m: Meta,
): IMap<string, TreeEntry> => {
    if (!parts.length) return t;
    const [head, ...rest] = parts;
    if (!rest.length) return t.set(head, m);
    const child = t.get(head);
    const next = child && !("path" in child)
        ? (child as IMap<string, TreeEntry>)
        : IMap<string, TreeEntry>();
    return t.set(head, insertMeta(next, rest, m));
};

const depthValue = (d: Depth): number => (d === true ? Infinity : d ?? 0);

export const createSyncStore = (artifact: Artifact) => {
    const watchers = new Map<string, InternalWatcher>();
    const transformCache = new WeakMap<Function, Map<string, unknown>>();
    const pending = new Map<
        string,
        Set<{ resolve: (v: unknown) => void; transform?: Function }>
    >();

    const ensureCache = <R>(
        oid: string,
        fn?: Function,
        compute?: () => R,
    ): R | undefined => {
        if (!fn) return compute?.();
        let per = transformCache.get(fn);
        if (!per) {
            per = new Map<string, unknown>();
            transformCache.set(fn, per);
        }
        if (per.has(oid)) return per.get(oid) as R;
        if (!compute) return undefined;
        const v = compute();
        per.set(oid, v);
        return v;
    };

    const handleBlobArrival = (oid: string, binary: Uint8Array) => {
        const waiters = pending.get(oid);
        if (!waiters) return;
        for (const { resolve, transform } of waiters) {
            const out = transform ? transform(binary) : binary;
            resolve(out);
        }
        pending.delete(oid);
    };

    const spawnWatch = (
        path: string,
        opts: Required<SubscriberOptions>,
        api: StoreApi<SyncStore>,
    ) => {
        const { depth, blobs } = opts;
        const controller = new AbortController();
        (async () => {
            try {
                for await (const evt of artifact.files.read.watch(path)) {
                    const { meta } = evt;
                    api.setState((s) => ({
                        tree: insertMeta(s.tree, split(meta.path), meta),
                        status: s.status.set(meta.oid, "fresh"),
                    }));

                    /* spawn child watchers for trees (auto fan‑out) */
                    const remaining = depth -
                        (split(meta.path).length - split(path).length) - 1;
                    if (meta.type === "tree" && remaining >= 0) {
                        api.getState().subscribePath(meta.path, {
                            depth: remaining as Depth,
                            blobs,
                        });
                    }

                    /* optional blob fetch */
                    if (blobs && meta.type === "blob") {
                        api.setState((s) => ({
                            status: s.status.set(meta.oid, "syncing"),
                        }));
                        const bin = await artifact.files.read.binary(meta.path)
                            .catch(() => undefined as Uint8Array | undefined);
                        if (bin) {
                            api.setState((s) => ({
                                files: s.files.set(meta.oid, bin),
                                status: s.status.set(meta.oid, "fresh"),
                            }));
                            handleBlobArrival(meta.oid, bin);
                        } else {
                            api.setState((s) => ({
                                status: s.status.set(meta.oid, "stale"),
                            })
                            );
                        }
                    }
                }
            } catch (_) { /* cancelled */ }
        })();

        watchers.set(path, {
            depth,
            blobs,
            count: 1,
            controller,
        });
    };

    const traverse = (
        tree: IMap<string, TreeEntry>,
        depth: number,
        metas: Meta[],
    ) => {
        tree.forEach((v) => {
            if ("path" in (v as Meta)) metas.push(v as Meta);
            else if (depth !== 0) {
                traverse(v as IMap<string, TreeEntry>, depth - 1, metas);
            }
        });
    };

    const store = create<SyncStore>((set, get, api) => ({
        commit: null,
        tree: IMap<string, TreeEntry>(),
        files: IMap<string, Uint8Array>(),
        status: IMap<string, SyncState>(),

        subscribePath: (path, options = {}) => {
            const depth = depthValue(options.depth);
            const blobs = !!options.blobs;
            const existing = watchers.get(path);
            if (existing) {
                existing.count += 1;
                watchers.set(path, existing);
                return;
            }
            spawnWatch(
                path,
                { depth, blobs },
                api as unknown as StoreApi<SyncStore>,
            );
        },

        unsubscribePath: (path) => {
            const w = watchers.get(path);
            if (!w) return;
            w.count -= 1;
            if (!w.count) {
                w.controller.abort();
                watchers.delete(path);
            } else watchers.set(path, w);
        },

        /* ------------- synchronous helpers ------------- */
        readFile: (p, transform) => {
            const m = get().getMeta(p);
            if (!m) return undefined;
            const bin = get().files.get(m.oid);
            if (!bin) return undefined;
            return ensureCache(
                m.oid,
                transform,
                () => (transform
                    ? transform(bin)
                    : (bin as unknown as typeof bin)),
            );
        },

        readDir: (dir, opts = {}) => {
            const rootParts = dir ? split(dir) : [];
            const depth = depthValue(opts.recursive);
            /* locate starting node */
            let node: TreeEntry | undefined = get().tree;
            for (const part of rootParts) {
                if (!("get" in node)) {
                    node = undefined;
                    break;
                }
                node = (node as IMap<string, TreeEntry>).get(part);
                if (!node) break;
            }
            const listing: Meta[] = [];
            if (node && "get" in node) {
                traverse(node as IMap<string, TreeEntry>, depth, listing);
            }
            const read = (arg: string | Meta) => {
                const meta = typeof arg === "string" ? get().getMeta(arg) : arg;
                if (!meta) return undefined;
                const bin = get().files.get(meta.oid);
                if (!bin) return undefined;
                return ensureCache(
                    meta.oid,
                    opts.transform,
                    () => (opts.transform
                        ? opts.transform(meta, bin)
                        : (bin as unknown as typeof bin)),
                );
            };
            const synced =
                listing.filter((m) => get().status.get(m.oid) === "fresh")
                    .length;
            return {
                listing,
                read,
                progress: { synced, total: listing.length },
            };
        },

        /* ------------- async helpers ------------- */
        oneOffRead: async (p, transform) => {
            const bin = await artifact.files.read.binary(p);
            return transform ? transform(bin) : (bin as unknown as typeof bin);
        },

        awaitFile: (p, transform) => {
            const val = get().readFile(p, transform);
            if (val !== undefined) return Promise.resolve(val);
            const m = get().getMeta(p);
            if (!m) return Promise.reject(new FileNotFoundError(p));
            return new Promise((resolve) => {
                let set = pending.get(m.oid);
                if (!set) {
                    set = new Set();
                    pending.set(m.oid, set);
                }
                set.add({ resolve, transform });
            });
        },

        /* ------------- selectors ------------- */
        getMeta: (path) => {
            const parts = split(path);
            let node: TreeEntry | undefined = get().tree;
            for (const part of parts) {
                if (!("get" in node)) return undefined;
                node = (node as IMap<string, TreeEntry>).get(part);
                if (!node) return undefined;
            }
            return "path" in (node as Meta) ? (node as Meta) : undefined;
        },

        isSynced: (path) => {
            const m = get().getMeta(path);
            return m ? get().status.get(m.oid) === "fresh" : false;
        },
    }));

    return store;
};

export const syncStoreGuard = (v: unknown): v is SyncStore =>
    typeof v === "object" && v !== null && "subscribePath" in v;

/* -------------------------------------------------- */
/* React hooks                                        */
/* -------------------------------------------------- */
export const createHooks = (store: StoreApi<SyncStore>) => {
    /* useFile (sync) */
    const useFile = <R = Uint8Array>(
        path: string,
        opts?: {
            transform?: (raw: Uint8Array) => R;
            depth?: Depth;
            blobs?: boolean;
        },
    ) => {
        store.getState().subscribePath(path, {
            depth: opts?.depth,
            blobs: opts?.blobs ?? true,
        });
        return store((s) => {
            const meta = s.getMeta(path);
            const data = s.readFile(path, opts?.transform);
            const synced = s.isSynced(path);
            return { meta, data, synced };
        });
    };

    /* useDir */
    const useDir = <R = Uint8Array>(
        path: string,
        opts?: ReadDirOptions<R> & { depth?: Depth; blobs?: boolean },
    ) => {
        store.getState().subscribePath(path, {
            depth: opts?.depth ?? opts?.recursive,
            blobs: opts?.blobs ?? true,
        });
        return store((s) => s.readDir<R>(path, opts));
    };

    /* convenience hooks */
    const useJsonFile = <T = unknown>(path: string, schema?: ZodTypeAny) => {
        return useFile<T>(path, {
            transform: (raw) => {
                const parsed = JSON.parse(new TextDecoder().decode(raw)) as T;
                return schema ? schema.parse(parsed) : parsed;
            },
        });
    };

    const useTextFile = (path: string) =>
        useFile<string>(path, {
            transform: (raw) => new TextDecoder().decode(raw),
        });

    const useBinaryFile = (path: string) => useFile<Uint8Array>(path);

    /* suspense‑compatible */
    const useFileSuspense = <R = Uint8Array>(
        path: string,
        transform?: (raw: Uint8Array) => R,
    ) => {
        const data = store.getState().readFile(path, transform);
        if (data !== undefined) return data;
        throw store.getState().awaitFile(path, transform);
    };

    return {
        useFile,
        useDir,
        useJsonFile,
        useTextFile,
        useBinaryFile,
        useFileSuspense,
    };
};
