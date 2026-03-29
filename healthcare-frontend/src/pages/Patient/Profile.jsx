import PatientSidebar from '../../components/patient/PatientSidebar'
import ProfileInfo from '../../components/patient/ProfileInfo'
import styles from '../../assets/style/Profile.module.css'

export default function Profile() {
  return (
    <div className={`container ${styles.layout}`}> 
      <PatientSidebar />
      <section className={styles.content}>
        <ProfileInfo />
      </section>
    </div>
  )
}


