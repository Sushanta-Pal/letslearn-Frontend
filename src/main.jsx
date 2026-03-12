import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HelmetProvider } from "react-helmet-async";

// 1. Wrap App with Helmet

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Wrap App with HelmetProvider */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
