import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import './styles/app.css'
import './styles/auth.css'
import App from './App.jsx'
import ConnectionStatus from './components/common/ConnectionStatus.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { TooltipProvider } from './components/ui/tooltip.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <ConnectionStatus />
          <App />
        </ErrorBoundary>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
