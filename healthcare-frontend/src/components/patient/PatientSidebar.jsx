import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import styles from '../../assets/style/Sidebar.module.css'
// Import your custom icons
import profileIcon from '../../assets/icons/my-profile-icon.svg'
import savedIcon from '../../assets/icons/my-saved-icon.svg'  
import logoutIcon from '../../assets/icons/my-logout-icon.svg'

export default function PatientSidebar() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/auth/login')
  }

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <aside className={styles.sidebar}>
        {/* Primary Navigation Buttons */}
        <div className={styles.primaryNav}>
          <NavLink
            to="/patient/profile"
            className={({ isActive }) => `${styles.primaryButton} ${isActive ? styles.active : ''}`}
          >
            <img src={profileIcon} alt="Profile" className={styles.buttonIcon} />
            Profile
          </NavLink>
        </div>

        {/* Secondary Navigation Links */}
        <div className={styles.secondaryNav}>
          <NavLink
            to="/patient/saved"
            className={({ isActive }) => `${styles.secondaryLink} ${isActive ? styles.active : ''}`}
          >
            <img src={savedIcon} alt="Saved" className={styles.linkIcon} />
            Saved
          </NavLink>
        </div>

        {/* Log Out Button */}
        <button onClick={handleLogout} className={styles.logoutButton}>
          <img src={logoutIcon} alt="Log Out" className={styles.linkIcon} />
          Log Out
        </button>
      </aside>

      {/* Mobile Horizontal Navigation Bar */}
      <nav className={styles.horizontalNav}>
        <div className={styles.navContainer}>
          <NavLink
            to="/patient/profile"
            className={({ isActive }) => `${styles.navButton} ${isActive ? styles.active : ''}`}
          >
            <img src={profileIcon} alt="Profile" className={styles.navIcon} />
            <span>Profile</span>
          </NavLink>
          
          <NavLink
            to="/patient/saved"
            className={({ isActive }) => `${styles.navButton} ${isActive ? styles.active : ''}`}
          >
            <img src={savedIcon} alt="Saved" className={styles.navIcon} />
            <span>Saved</span>
          </NavLink>
          
          <button onClick={handleLogout} className={styles.navButton}>
            <img src={logoutIcon} alt="Log Out" className={styles.navIcon} />
            <span>Log Out</span>
          </button>
        </div>
      </nav>
    </>
  )
}

