import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAuth from '../../hooks/useAuth'
import styles from '../../assets/style/Sidebar.module.css'
import layoutStyles from '../../assets/style/AdminLayout.module.css'
import profileIcon from '../../assets/icons/my-profile-icon.svg'
import logoutIcon from '../../assets/icons/my-logout-icon.svg'
import dashboardIcon from '../../assets/icons/dashboard.svg'
import articlesIcon from '../../assets/icons/articles.svg'
import usersIcon from   '../../assets/icons/users.svg'
import aboutIcon from '../../assets/icons/about.svg'
import tipsIcon from '../../assets/icons/tips.svg'


export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/auth/login')
  }

  function closeSidebar() {
    if (onClose) {
      onClose()
    }
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e) => {
        if (e.target.classList.contains(layoutStyles.mobileOverlay)) {
          closeSidebar()
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className={layoutStyles.mobileOverlay}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? layoutStyles.sidebarOpen : ''}`}>
        <div className={styles.primaryNav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `${styles.primaryButton} ${isActive ? styles.active : ''}`}
            onClick={closeSidebar}
          >
            <img src={dashboardIcon} alt="Dashboard" className={styles.buttonIcon} />
            Dashboard
          </NavLink>
        </div>

        <div className={styles.secondaryNav}>
          <NavLink
            to="/admin/manage-users"
            className={({ isActive }) => `${styles.secondaryLink} ${isActive ? styles.active : ''}`}
            onClick={closeSidebar}
          >
            <img src={usersIcon} alt="Manage Users" className={styles.linkIcon} />
            Manage Users
          </NavLink>

          <NavLink
            to="/admin/manage-articles"
            className={({ isActive }) => `${styles.secondaryLink} ${isActive ? styles.active : ''}`}
            onClick={closeSidebar}
          >
            <img src={articlesIcon} alt="Manage Articles" className={styles.linkIcon} />
            Manage Articles
          </NavLink>

          <NavLink
            to="/admin/manage-healthy-tips"
            className={({ isActive }) => `${styles.secondaryLink} ${isActive ? styles.active : ''}`}
            onClick={closeSidebar}
          >
            <img src={tipsIcon} alt="Manage Tips" className={styles.linkIcon} />
            Manage Tips
          </NavLink>

          <NavLink
            to="/admin/manage-about-page"
            className={({ isActive }) => `${styles.secondaryLink} ${isActive ? styles.active : ''}`}
            onClick={closeSidebar}
          >
            <img src={aboutIcon} alt="Manage About Page" className={styles.linkIcon} />
            Manage About Page
          </NavLink>

          <NavLink
            to="/admin/profile"
            className={({ isActive }) => `${styles.secondaryLink} ${isActive ? styles.active : ''}`}
            onClick={closeSidebar}
          >
            <img src={profileIcon} alt="Profile" className={styles.linkIcon} />
            Profile
          </NavLink>
        </div>

        <button onClick={() => { handleLogout(); closeSidebar(); }} className={styles.logoutButton}>
          <img src={logoutIcon} alt="Log Out" className={styles.linkIcon} />
          Logout
        </button>
      </aside>
    </>
  )
}


