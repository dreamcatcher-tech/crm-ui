import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createWebArtifact } from '@artifact/context/web-client'
import { ArtifactProvider, createSyncStore } from '@artifact/context'
import type { Artifact } from '@artifact/api'

declare global {
  var artifact: Awaited<ReturnType<typeof createWebArtifact>> | undefined
}

const url = import.meta.env.VITE_WEB_CLIENT_URL
const identity = import.meta.env.VITE_DID

function Boot() {
  const [artifact, setArtifact] = useState<Artifact>()
  const [error, setError] = useState<unknown>()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      let bearerToken: string | null = localStorage.getItem('bearerToken')
      if (!bearerToken) {
        bearerToken = prompt('Enter authorization token') ?? null
        if (typeof bearerToken !== 'string' || bearerToken.length === 0) {
          throw new Error('No authorization token provided')
        }
        localStorage.setItem('bearerToken', bearerToken)
      }

      try {
        let a = await createWebArtifact(url, identity, bearerToken)
        const [repo] = await a.tree.ls()
        if (!repo) {
          throw new Error('Failed to get repo')
        }

        a = a.checkout({ repo })
        const branches = await a.repo.branches.ls()
        for (const branch of branches) {
          const b = await a.checkout({ branch: [branch] }).latest()
          console.log(await b.files.read.ls())
        }
        a = await a.checkout({ repo, branch: ['changes'] }).latest()

        if (cancelled) return
        globalThis.artifact = a
        setArtifact(a)
      } catch (e) {
        if (cancelled) return
        console.error(e)
        localStorage.removeItem('bearerToken')
        setError(e)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const store = useMemo(
    () => (artifact ? createSyncStore(artifact) : undefined),
    [artifact],
  )

  useEffect(() => {
    if (!store) return
    store.getState().watch({ path: 'Name' })
    const unsub = store.subscribe((state) => {
      console.log(state.readMeta('Name'))
      // console.log(state.readDir('Name'))
    })
    return unsub
  }, [store])

  if (error) {
    return <div>{String(error)}</div>
  }

  if (!artifact) {
    return <div>Loading…</div>
  }

  return (
    <ArtifactProvider artifact={artifact}>
      <App />
    </ArtifactProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boot />
  </StrictMode>,
)
