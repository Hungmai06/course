import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './dolphinlearn/dolphinlearn.css'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import AuthProvider from './48ngay/hooks/AuthProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
