import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NotificationProvider } from './context/NotificationContext'
import { GlobalErrorBoundary } from './GlobalErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)

