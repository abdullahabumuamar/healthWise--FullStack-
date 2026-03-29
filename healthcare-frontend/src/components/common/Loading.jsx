import styles from '../../assets/style/Loading.module.css'

export default function Loading({ message = 'Loading...', size = 'medium' }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}

