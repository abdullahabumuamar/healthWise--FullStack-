import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { useToast } from '../../components/common/ToastContainer'
import PasswordInput from '../../components/common/PasswordInput'
import styles from '../../assets/style/Auth.module.css'
import page from '../../assets/style/Page.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(email, password, rememberMe)
      
      if (result.success) {
        success('Login successful')
        // Redirect based on user role
        const userRole = result.user?.role || 'patient'
        if (userRole === 'admin') {
          navigate('/admin')
        } else {
          navigate('/patient/dashboard')
        }
      } else {
        showError(result.error || 'Login failed')
      }
    } catch (err) {
      showError('An error occurred during login')
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

        <div>
          <h3 style={{ textAlign: 'center' }}>Log In</h3>
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
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={isLoading}
            />
            <div className={styles.row}>
              <Link className={styles.link} to="#">Forgot Password?</Link>
              <label className="row" style={{ color: '#6b7280' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                /> 
                Remember me
              </label>
            </div>
            <button 
              className={styles.primary} 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
            <p style={{ textAlign: 'center' }}>Don't have an account ? <Link className={styles.link} to="/auth/register">Sign Up</Link></p>
          </form>
        </div>
      </div>
    </div>
  )
}


