import { useAbout } from '../../context/AboutContext'
import styles from '../../assets/style/About.module.css'

export default function About() {
  const { aboutData } = useAbout()

  return (
    <div className={styles.aboutPage}>
      {/* Header Section */}
      <section className={styles.headerSection}>
        <h1 className={styles.headerTitle}>{aboutData.header.title}</h1>
        <p className={styles.headerSubtitle}>{aboutData.header.subtitle}</p>
      </section>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Mission Section */}
        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <span className={styles.sectionLabel}>Mission</span>
            <h2 className={styles.sectionTitle}>Our Mission</h2>
            <p className={styles.sectionText}>{aboutData.mission.text}</p>
          </div>
          {aboutData.mission.image ? (
            <img 
              src={aboutData.mission.image} 
              alt="Mission" 
              className={styles.sectionImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.sectionImagePlaceholder}>
              Mission Image
            </div>
          )}
        </section>

        {/* Vision Section */}
        <section className={`${styles.section} ${styles.visionSection}`}>
          {aboutData.vision.image ? (
            <img 
              src={aboutData.vision.image} 
              alt="Vision" 
              className={styles.sectionImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.sectionImagePlaceholder}>
              Vision Image
            </div>
          )}
          <div className={styles.sectionContent}>
            <span className={styles.sectionLabel}>Vision</span>
            <h2 className={styles.sectionTitle}>Our Vision</h2>
            <p className={styles.sectionText}>{aboutData.vision.text}</p>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className={styles.whatWeOfferSection}>
          <h2 className={styles.whatWeOfferTitle}>What We Offer</h2>
          <div className={styles.cardsGrid}>
            {aboutData.whatWeOffer.cards.map((card) => (
              <div key={card.id} className={styles.card}>
                {card.image ? (
                  <img 
                    src={card.image} 
                    alt={card.title} 
                    className={styles.cardImage}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.cardImagePlaceholder}>
                    image view
                  </div>
                )}
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDescription}>{card.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
