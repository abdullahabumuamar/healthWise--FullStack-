import { useState, useMemo } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useUsers } from '../../context/UsersContext'
import { useArticles } from '../../context/ArticlesContext'
import { useHealthTips } from '../../context/HealthTipsContext'
import { formatDateShort } from '../../utils/dateUtils'
import layoutStyles from '../../assets/style/AdminLayout.module.css'
import styles from '../../assets/style/AdminDashboard.module.css'
import usersIcon from '../../assets/icons/users.svg'
import articlesIcon from '../../assets/icons/articles.svg'
import tipsIcon from '../../assets/icons/tips.svg'
import dashboardIcon from '../../assets/icons/dashboard.svg'
import AiIcon from '../../assets/icons/Ai.svg'

export default function AdminDashboard() {
  const { users } = useUsers()
  const { articles } = useArticles()
  const { tips } = useHealthTips()

  // Calculate recent updates (latest one from each type)
  const recentUpdates = useMemo(() => {
    const updates = []
    
    // Get latest article
    if (articles.length > 0) {
      const latestArticle = [...articles].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0)
        const dateB = new Date(b.createdAt || b.date || 0)
        return dateB - dateA
      })[0]
      updates.push({
        type: 'Article',
        title: latestArticle.title,
        date: latestArticle.createdAt || latestArticle.date,
        icon: articlesIcon
      })
    }
    
    // Get latest tip
    if (tips.length > 0) {
      const latestTip = [...tips].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB - dateA
      })[0]
      updates.push({
        type: 'Tip',
        title: latestTip.title,
        date: latestTip.createdAt,
        icon: tipsIcon
      })
    }
    
    // Get latest user
    if (users.length > 0) {
      const latestUser = [...users].sort((a, b) => {
        // Use createdAt (full timestamp) for accurate sorting
        const dateA = new Date(a.createdAt || a.registeredDate || a.regDate || 0)
        const dateB = new Date(b.createdAt || b.registeredDate || b.regDate || 0)
        return dateB - dateA
      })[0]
      updates.push({
        type: 'User',
        title: `${latestUser.email} registered`,
        // Use createdAt (fallback to registeredDate/regDate for old data)
        date: latestUser.createdAt || latestUser.registeredDate || latestUser.regDate,
        icon: usersIcon
      })
    }
    
    // Sort by date (newest first)
    return updates.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [articles, tips, users])

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <AdminNavbar onMenuToggle={setIsSidebarOpen} isMenuOpen={isSidebarOpen} />
      <div className="container">
        <main className="main" style={{ paddingTop: 16 }}>
          <div className={layoutStyles.layout}>
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className={layoutStyles.content}>
              <div className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.subtitle}>Welcome back, Admin!</p>
              </div>

              <section aria-label="summary-cards" className={styles.cardsGrid}>
                <div className={`${styles.card} ${styles.users}`}>
                  <div className={styles.iconRow}>
                    <div className={styles.iconWrap}><img className={styles.icon} src={usersIcon} alt="Users" /></div>
                  </div>
                  <div className={styles.cardTitle}>Total Users</div>
                  <div className={styles.cardValue}>{users.length.toLocaleString()}</div>
                </div>
                <div className={`${styles.card} ${styles.articles}`}>
                  <div className={styles.iconRow}>
                    <div className={styles.iconWrap}><img className={styles.icon} src={articlesIcon} alt="Articles" /></div>
                  </div>
                  <div className={styles.cardTitle}>Articles Published</div>
                  <div className={styles.cardValue}>{articles.length.toLocaleString()}</div>
                </div>
                <div className={`${styles.card} ${styles.tips}`}>
                  <div className={styles.iconRow}>
                    <div className={styles.iconWrap}><img className={styles.icon} src={tipsIcon} alt="Tips" /></div>
                  </div>
                  <div className={styles.cardTitle}>Healthy Tips Published</div>
                  <div className={styles.cardValue}>{tips.length.toLocaleString()}</div>
                </div>
                <div className={`${styles.card} ${styles.ai}`}>
                  <div className={styles.iconRow}>
                    <div className={styles.iconWrap}><img className={styles.icon} src={AiIcon} alt="AI Checks" /></div>
                  </div>
                  <div className={styles.cardTitle}>AI Symptom Checks</div>
                  <div className={styles.cardValue}>513</div>
                </div>
              </section>

              <section className={styles.section} aria-label="recent-activity">
                <h2 className={styles.sectionTitle}>Recent Activity / Latest Updates</h2>
                <div className={styles.tableWrap}>
                  {recentUpdates.length > 0 ? (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Type</th>
                          <th className={styles.th}>Title</th>
                          <th className={styles.th}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUpdates.map((update, index) => (
                          <tr key={`${update.type}-${update.date}-${index}`} className={styles.row}>
                            <td className={styles.td}>
                              <span className={styles.type}>
                                <span className={`${styles.badge} ${styles.badgeBlue}`}>
                                  <img className={styles.badgeIcon} src={update.icon} alt={update.type} />
                                </span> {update.type}
                              </span>
                            </td>
                            <td className={styles.td}>{update.title}</td>
                            <td className={styles.td}>{formatDateShort(update.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className={styles.emptyState}>
                      <p>No recent updates available</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}


