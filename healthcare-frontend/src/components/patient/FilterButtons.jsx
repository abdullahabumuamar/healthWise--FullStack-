import styles from '../../assets/style/Profile.module.css'

export default function FilterButtons({ selectedCategory, setSelectedCategory, savedItems }) {
  return (
    <div className={styles.filterButtons}>
      <button 
        className={`${styles.filterBtn} ${selectedCategory === 'all' ? styles.activeFilter : ''}`}
        onClick={() => setSelectedCategory('all')}
      >
        All ({savedItems.length})
      </button>
      <button 
        className={`${styles.filterBtn} ${selectedCategory === 'LIVING HEALTHY' ? styles.activeFilter : ''}`}
        onClick={() => setSelectedCategory('LIVING HEALTHY')}
      >
        Living Healthy ({savedItems.filter(item => item.category === 'LIVING HEALTHY').length})
      </button>
      <button 
        className={`${styles.filterBtn} ${selectedCategory === 'HEALTH ARTICLES' ? styles.activeFilter : ''}`}
        onClick={() => setSelectedCategory('HEALTH ARTICLES')}
      >
        Health Articles ({savedItems.filter(item => item.category === 'HEALTH ARTICLES').length})
      </button>
    </div>
  )
}

