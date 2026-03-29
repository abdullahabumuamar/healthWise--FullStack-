import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { useToast } from '../../components/common/ToastContainer'
import PasswordInput from '../../components/common/PasswordInput'
import styles from '../../assets/style/Auth.module.css'
import page from '../../assets/style/Page.module.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await register(email, password, dateOfBirth, confirmPassword)
      
      if (result.success) {
        success('Account created successfully')
        // Redirect based on user role
        const userRole = result.user?.role || 'patient'
        if (userRole === 'admin') {
          navigate('/admin')
        } else {
          navigate('/patient/dashboard')
        }
      } else {
        showError(result.error || 'Registration failed')
      }
    } catch (err) {
      showError('An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`${page.wrap}`} style={{ padding: '24px 0' }}>
      <div className={styles.split}>
        <div className={styles.panel}>
          <h2 className={styles.heading}>Get Access to everything HealthWise offers</h2>
          <ul className={styles.points}>
            <li className={styles.point}>
              <div style={{ fontWeight: 600 }}>AI-powered symptom checking and early diagnosis</div>
            </li>
            <li className={styles.point}>
              <div style={{ fontWeight: 600 }}>Personalized diet assistance and nutrition guidance</div>
            </li>
            <li className={styles.point}>
              <div style={{ fontWeight: 600 }}>Save and organize health articles and wellness tips</div>
            </li>
          </ul>
        </div>

        <div style={{ marginTop: '64px' }}>
          <h3 style={{ textAlign: 'center' }}>Sign Up</h3>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input 
              className={styles.input} 
              placeholder="Email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={isLoading}
            />
            <input 
              className={styles.input} 
              placeholder="Date of birth (mm/dd/yyyy)" 
              type="date" 
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required 
              disabled={isLoading}
            />
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={isLoading}
            />
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              disabled={isLoading}
            />
            <button 
              className={styles.primary} 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
            <p className={styles.muted}>
              By signing up, I agree to Healthwise Terms of Use & Privacy Policy. I understand that I may opt out of subscriptions at any time.
            </p>
            <p style={{ textAlign: 'center', marginTop: '-8px' }}>Already have an account ? <Link className={styles.link} to="/auth/login">Log In</Link></p>
          </form>
        </div>
      </div>
    </div>
  )
}


