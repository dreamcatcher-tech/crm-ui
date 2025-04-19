import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createSyncStore } from './store.ts'
import { createWebArtifact } from '@artifact/context/web-client'
//
declare global {
  var artifact: Awaited<ReturnType<typeof createWebArtifact>> | undefined
}

const url = import.meta.env.VITE_WEB_CLIENT_URL
const identity = import.meta.env.VITE_DID



let bearerToken = localStorage.getItem('bearerToken')
if (!bearerToken) {
  bearerToken = prompt('Enter authorization token')
  if (!bearerToken) {
    throw new Error('No authorization token provided')
  }
  localStorage.setItem('bearerToken', bearerToken)
}

let artifact: Awaited<ReturnType<typeof createWebArtifact>> | undefined

const go = async () => {
  try {
    artifact = await createWebArtifact(url, identity, bearerToken)
  } catch (error) {
    console.error(error)
    localStorage.removeItem('bearerToken')
    alert(error)
  }
  if (!artifact) {
    globalThis.location.reload()
    throw new Error('Failed to create artifact')
  }

  const [repo] = await artifact.tree.ls()
  if (!repo) {
    throw new Error('Failed to get repo')
  }
  console.log('repo', repo)

  artifact = artifact.checkout({ repo })

  const branches = await artifact.repo.branches.ls()
  for (const branch of branches) {
    console.log(branch)
    const a = await artifact.checkout({ branch: [branch] }).latest()
    console.log(await a.files.read.ls())
  }
  artifact = await artifact.checkout({ repo, branch: ['changes'] }).latest()
  globalThis.artifact = artifact
}

go()

// artifact = await artifact.checkout({ repo, branch: ['changes']})

// const customers = await artifact.shards.read.ls('Name')

// console.log(customers);

// const store = createSyncStore(artifact)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
