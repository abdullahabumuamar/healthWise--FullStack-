import { Link } from 'react-router-dom'
import styles from '../../assets/style/Navbar.module.css'
import layoutStyles from '../../assets/style/AdminLayout.module.css'
// Import your custom icons
import plusIcon from '../../assets/icons/plus.svg'
import profileIcon from '../../assets/icons/my-profile-icon.svg'

export default function AdminNavbar({ onMenuToggle, isMenuOpen }) {
  const handleMenuToggle = () => {
    if (onMenuToggle) {
      onMenuToggle(!isMenuOpen)
    }
  }

  return (
    <header className={styles.nav}>
      <div className={`${styles.wide} ${styles.inner}`}>
        <div className={styles.left}>
          <button 
            className={layoutStyles.mobileMenuToggle}
            onClick={handleMenuToggle}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen || false}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
          <Link to="/admin" className={styles.brand}>
            <img src={plusIcon} alt="Plus" className={styles.plusIcon} />
            <span>HealthWise Control Panel</span>
          </Link>
        </div>
        <div className={styles.rightContainer}>
          <Link to="/admin/profile" className={styles.user} aria-label="Admin Profile">
            <img src={profileIcon} alt="Profile" className={styles.userIcon} />
          </Link>
        </div>
      </div>
    </header>
  )
}

