import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      showMessage('Please enter your email address.', 'error')
      return
    }

    try {
      setLoading(true)
      await resetPassword(email)
      showMessage('Password reset email sent! Check your inbox and follow the instructions.', 'success')
      setTimeout(() => navigate('/login'), 3000)
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.'
          break
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.'
          break
      }
      
      showMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Enter your email to receive a password reset link</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Sending Reset Email...' : 'Send Reset Email'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
        
        <p className="auth-link">
          Remember your password? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  )
}