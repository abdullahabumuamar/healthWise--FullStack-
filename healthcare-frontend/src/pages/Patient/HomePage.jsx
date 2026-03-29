import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useHealthTips } from '../../context/HealthTipsContext'
import { useArticles } from '../../context/ArticlesContext'
import { formatDateLong } from '../../utils/dateUtils'
import styles from '../../assets/style/Home.module.css'
import page from '../../assets/style/Page.module.css'

export default function HomePage() {
  const [showAllCards, setShowAllCards] = useState(false)
  const [showAllArticles, setShowAllArticles] = useState(false)
  const { tips } = useHealthTips()
  const { articles } = useArticles()
  const navigate = useNavigate()

  // Removed debug console.log statements for production optimization

  const handleArticleClick = (articleId) => {
    navigate(`/patient/article/${articleId}`)
  }

  const firstRowCards = tips.slice(0, 4)
  const remainingCards = tips.slice(4)

  const handleCardClick = (tipId) => {
    navigate(`/patient/tip/${tipId}`)
  }

  const firstRowArticles = articles.slice(0, 3)
  const remainingArticles = articles.slice(3)

  const handleToggleView = (e) => {
    e.preventDefault()
    setShowAllCards(!showAllCards)
  }

  const handleToggleArticles = (e) => {
    e.preventDefault()
    setShowAllArticles(!showAllArticles)
  }

  return (
    <div className={`container ${page.wrap}`}>
      <section className={`${styles.hero} container`}>
        <h1>Welcome to Health wise</h1>
        <p>start taking control of your health today</p>
        <Link className={styles.cta} to="/patient/symptom-checker">Start Symptom Check</Link>
      </section>
      <div className={page.content}>
        <div className={styles.row}>
          <strong style={{ letterSpacing: 0.5 }}>LIVING HEALTHY</strong>
          {tips.length > 4 && (
            <Link to="#" className="link" onClick={handleToggleView}>
              {showAllCards ? 'View Less' : 'View All'}
            </Link>
          )}
        </div>
        {tips.length > 0 ? (
          <>
            <div className={styles.cards}>
              {firstRowCards.map((card) => (
                <div 
                  key={card.id} 
                  className={styles.card}
                  onClick={() => handleCardClick(card.id)}
                >
                  <img className={styles.cardImage} src={card.image || 'https://via.placeholder.com/400x200?text=No+Image'} alt={card.title} loading="lazy" />
                  <div className={styles.cardTitle}>{card.title}</div>
                </div>
              ))}
            </div>
            {showAllCards && remainingCards.length > 0 && (
              <div className={styles.cards}>
                {remainingCards.map((card) => (
                  <div 
                    key={card.id} 
                    className={styles.card}
                    onClick={() => handleCardClick(card.id)}
                  >
                    <img className={styles.cardImage} src={card.image || 'https://via.placeholder.com/400x200?text=No+Image'} alt={card.title} loading="lazy" />
                    <div className={styles.cardTitle}>{card.title}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>No health tips available yet. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Articles Section */}
      <div className={`${page.content} ${styles.articlesSection}`}>
        <div className={styles.row}>
          <strong style={{ letterSpacing: 0.5 }}>HEALTH ARTICLES</strong>
          {articles.length > 3 && (
            <Link to="#" className="link" onClick={handleToggleArticles}>
              {showAllArticles ? 'View Less' : 'View All'}
            </Link>
          )}
        </div>
        {articles.length > 0 ? (
          <>
            <div className={styles.articlesGrid}>
              {firstRowArticles.map((article) => (
                <div 
                  key={article.id} 
                  className={styles.articleCard}
                  onClick={() => handleArticleClick(article.id)}
                >
                  <img 
                    src={article.image || 'https://via.placeholder.com/400x250?text=No+Image'} 
                    alt={article.title}
                    className={styles.articleCardImage}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250?text=No+Image'
                    }}
                  />
                  <div className={styles.articleContent}>
                    <span className={styles.articleDate}>{formatDateLong(article.date)}</span>
                    <h3 className={styles.articleTitle}>{article.title}</h3>
                    <p className={styles.articleExcerpt}>{article.shortDescription}</p>
                    <button 
                      className={styles.readMoreBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArticleClick(article.id)
                      }}
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {showAllArticles && remainingArticles.length > 0 && (
              <div className={styles.articlesGrid}>
                {remainingArticles.map((article) => (
                  <div 
                    key={article.id} 
                    className={styles.articleCard}
                    onClick={() => handleArticleClick(article.id)}
                  >
                    <img 
                      src={article.image || 'https://via.placeholder.com/400x250?text=No+Image'} 
                      alt={article.title}
                      className={styles.articleCardImage}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x250?text=No+Image'
                      }}
                    />
                    <div className={styles.articleContent}>
                      <span className={styles.articleDate}>{formatDateLong(article.date)}</span>
                      <h3 className={styles.articleTitle}>{article.title}</h3>
                      <p className={styles.articleExcerpt}>{article.shortDescription}</p>
                      <button 
                        className={styles.readMoreBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleArticleClick(article.id)
                        }}
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>No articles available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}


