import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AppRoutes from './routes/AppRoutes.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import ScrollToTop from './components/common/ScrollToTop.jsx'
import './assets/style/global.css'

function App() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <ErrorBoundary>
      <ScrollToTop />
      {!isAdminPage && <Navbar />}
      {!isAdminPage && (
        <div className="container">
          <main className="main">
            <AppRoutes />
          </main>
        </div>
      )}
      {isAdminPage && <AppRoutes />}
      {!isAdminPage && <Footer />}
    </ErrorBoundary>
  )
}

export default App
