import { serveDir } from 'jsr:@std/http/file-server'

Deno.serve(
  { port: 8080 },
  (req: Request) => serveDir(req, { fsRoot: './dist' }),
)
