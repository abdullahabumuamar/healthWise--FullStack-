import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { HealthTipsProvider } from './context/HealthTipsContext.jsx'
import { ArticlesProvider } from './context/ArticlesContext.jsx'
import { AboutProvider } from './context/AboutContext.jsx'
import { ToastProvider } from './components/common/ToastContainer.jsx'
import { ConditionalProviders } from './components/common/ConditionalProviders.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <ConditionalProviders>
              <HealthTipsProvider>
                <ArticlesProvider>
                  <AboutProvider>
                    <App />
                  </AboutProvider>
                </ArticlesProvider>
              </HealthTipsProvider>
            </ConditionalProviders>
          </UserProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
