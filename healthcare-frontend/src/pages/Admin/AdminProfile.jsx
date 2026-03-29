import { useState } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import ProfileInfo from '../../components/patient/ProfileInfo'
import layoutStyles from '../../assets/style/AdminLayout.module.css'
import styles from '../../assets/style/Profile.module.css'

export default function AdminProfile() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <AdminNavbar onMenuToggle={setIsSidebarOpen} isMenuOpen={isSidebarOpen} />
      <div className="container">
        <main className="main" style={{ paddingTop: 16 }}>
          <div className={layoutStyles.layout}>
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className={layoutStyles.content}>
              <div className={styles.content}>
                <ProfileInfo />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
