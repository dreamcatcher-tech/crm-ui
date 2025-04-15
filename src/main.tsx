import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { createWebArtifact } from '@artifact/context/web-client';

const url = import.meta.env.VITE_WEB_CLIENT_URL;
const identity = import.meta.env.VITE_DID;

let bearerToken = localStorage.getItem('bearerToken');
if (!bearerToken) {
  bearerToken = prompt('Enter authorization token');
  if (!bearerToken) {
    throw new Error('No authorization token provided');
  }
  localStorage.setItem('bearerToken', bearerToken);
}

let artifact
try {
  artifact = await createWebArtifact(url, identity, bearerToken);
} catch (error) {
  console.error(error);
  localStorage.removeItem('bearerToken');
  alert(error)
  window.location.reload();
}

(globalThis as any).artifact = artifact;




createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
