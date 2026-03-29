import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import styles from '../assets/style/Navbar.module.css'
// Import your custom icons
import plusIcon from '../assets/icons/plus.svg'
import profileIcon from '../assets/icons/my-profile-icon.svg'

export default function Navbar() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const isAuthPage = location.pathname === '/auth/login' || location.pathname === '/auth/register'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className={styles.nav}>
      <div className={`${styles.wide} ${styles.inner}`}>
        <div className={styles.left}>
          {!isAuthPage && (
            <button 
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          )}
          <Link to="/patient/home" className={styles.brand} onClick={closeMobileMenu}>
            <img src={plusIcon} alt="Plus" className={styles.plusIcon} />
            <span>HealthWise</span>
          </Link>
        </div>
        {!isAuthPage && (
          <>
            <nav className={styles.links}>
              <NavLink to="/patient/symptom-checker">Symptom checker</NavLink>
              <NavLink to="/patient/diet-assistance">Diet Assistance</NavLink>
              <NavLink to="/patient/active-ai">ActiveAI</NavLink>
              <NavLink to="/patient/about">About</NavLink>
            </nav>
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
              <nav className={styles.mobileMenuLinks}>
                <NavLink to="/patient/symptom-checker" onClick={closeMobileMenu}>Symptom checker</NavLink>
                <NavLink to="/patient/diet-assistance" onClick={closeMobileMenu}>Diet Assistance</NavLink>
                <NavLink to="/patient/active-ai" onClick={closeMobileMenu}>ActiveAI</NavLink>
                <NavLink to="/patient/about" onClick={closeMobileMenu}>About</NavLink>
              </nav>
            </div>
          </>
        )}
        <div className={styles.rightContainer}>
          {isAuthPage ? (
            <NavLink to="/auth/login" className={styles.loginLink}>
              Login
            </NavLink>
          ) : isAuthenticated ? (
            <Link to="/patient/profile" className={styles.user} aria-label="User" onClick={closeMobileMenu}>
              <img src={profileIcon} alt="Profile" className={styles.userIcon} />
            </Link>
          ) : (
            <NavLink to="/auth/login" className={styles.loginLink}>
              Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}


