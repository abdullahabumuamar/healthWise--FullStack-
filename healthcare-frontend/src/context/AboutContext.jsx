import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AboutContext = createContext()

// Default about page data (fallback if API fails)
const defaultAboutData = {
  header: {
    title: 'About HealthWise',
    subtitle: 'Empowering healthy living through knowledge and smart tools.'
  },
  mission: {
    title: 'Our Mission',
    image: '',
    text: 'We aim to build tools that enable users to gain clarity and control over their health while promoting trust and innovation. By cultivating a customer-centric approach, we ensure that every individual can achieve long-term health stability and success.'
  },
  vision: {
    title: 'Our Vision',
    image: '',
    text: 'We empower individuals and businesses to achieve health clarity and success. We strive to foster a world where managing health is simple, secure, and accessible to all.'
  },
  whatWeOffer: {
    cards: [
      {
        id: 1,
        title: 'Symptom Checker',
        description: 'Identify potential health issues by analyzing your symptoms and get recommendations for next steps.',
        image: ''
      },
      {
        id: 2,
        title: 'Diet Assistance',
        description: 'Get personalized dietary recommendations and meal plans tailored to your health goals and needs.',
        image: ''
      },
      {
        id: 3,
        title: 'Mental Health Tips',
        description: 'Access resources and tips to maintain and improve your mental wellbeing and emotional health.',
        image: ''
      },
      {
        id: 4,
        title: 'Exercise Assistance',
        description: 'Get personalized exercise recommendations and workout plans tailored to your fitness goals and health needs.',
        image: ''
      }
    ]
  }
}

export function AboutProvider({ children }) {
  const [aboutData, setAboutData] = useState(defaultAboutData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch about data from API on mount
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/about')
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // API returns array, get first item
          const aboutItem = response.data[0]
          // Transform API data to match expected format
          const transformedData = {
            header: {
              title: aboutItem.title || defaultAboutData.header.title,
              subtitle: aboutItem.subtitle || defaultAboutData.header.subtitle
            },
            mission: {
              title: 'Our Mission',
              image: aboutItem.missionImage || '',
              text: aboutItem.missionText || defaultAboutData.mission.text
            },
            vision: {
              title: 'Our Vision',
              image: aboutItem.visionImage || '',
              text: aboutItem.visionText || defaultAboutData.vision.text
            },
            whatWeOffer: {
              cards: aboutItem.servicesCards || defaultAboutData.whatWeOffer.cards
            }
          }
          setAboutData(transformedData)
          console.log('AboutContext - Fetched about data from API')
        }
      } catch (error) {
        console.error('Error fetching about data from API:', error)
        setError('Failed to load about page. Using default data.')
        // Keep default data on error
      } finally {
        setLoading(false)
      }
    }

    fetchAbout()
  }, [])

  const updateAboutData = async (updatedData) => {
    try {
      setLoading(true)
      setError(null)
      
      // Transform the frontend format to API format
      const apiData = {
        title: updatedData.header.title,
        subtitle: updatedData.header.subtitle,
        missionText: updatedData.mission.text,
        missionImage: updatedData.mission.image || '',
        visionText: updatedData.vision.text,
        visionImage: updatedData.vision.image || '',
        servicesCards: updatedData.whatWeOffer.cards
      }
      
      // Check if about data exists (id 1)
      const response = await api.get('/about')
      const existingAbout = response.data && Array.isArray(response.data) && response.data.length > 0 
        ? response.data[0] 
        : null
      
      if (existingAbout) {
        // Update existing about data
        const updateResponse = await api.put(`/about/${existingAbout.id}`, apiData)
        console.log('AboutContext - About data updated via API:', updateResponse.data)
      } else {
        // Create new about data
        const createResponse = await api.post('/about', { ...apiData, id: 1 })
        console.log('AboutContext - About data created via API:', createResponse.data)
      }
      
      // Update local state
      setAboutData(updatedData)
    } catch (error) {
      console.error('Error updating about data in API:', error)
      setError('Failed to save about page. Please try again.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AboutContext.Provider value={{ aboutData, updateAboutData, loading, error }}>
      {children}
    </AboutContext.Provider>
  )
}

export function useAbout() {
  const context = useContext(AboutContext)
  if (!context) {
    throw new Error('useAbout must be used within an AboutProvider')
  }
  return context
}

