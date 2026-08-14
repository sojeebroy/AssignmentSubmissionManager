import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './router/AppRouter'

// Diagnostic logs to help identify runtime errors in the browser
console.log('main.tsx loaded')
window.addEventListener('error', (e) => {
  console.error('Unhandled error:', (e as ErrorEvent).error || (e as ErrorEvent).message)
  const root = document.getElementById('root')
  if (root) {
    const message = (e as ErrorEvent).message || 'Unknown error'
    root.innerHTML = `<pre style="color: red; white-space: pre-wrap; text-align: left; padding: 16px;">Unhandled error: ${message}</pre>`
  }
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', (e as PromiseRejectionEvent).reason)
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `<pre style="color: red; white-space: pre-wrap; text-align: left; padding: 16px;">Unhandled rejection: ${JSON.stringify((e as PromiseRejectionEvent).reason, null, 2)}</pre>`
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
