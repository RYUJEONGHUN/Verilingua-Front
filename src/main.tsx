import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // <React.StrictMode> 태그를 지우고 <App />만 남기세요.
  <App />
)
