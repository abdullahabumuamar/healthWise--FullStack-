import PatientSidebar from '../../components/patient/PatientSidebar'
import SavedItems from '../../components/patient/SavedItems'
import styles from '../../assets/style/Profile.module.css'

export default function Saved() {
  return (
    <div className={`container ${styles.layout}`}>
      <PatientSidebar />
      <section className={styles.content}>
        <SavedItems />
      </section>
    </div>
  )
}

