import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/:word" element={<App />} />
        <Route path="/:word/:include" element={<App />} />
        <Route path="/:word/:include/:exclude" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
