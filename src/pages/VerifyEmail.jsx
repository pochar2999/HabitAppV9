import React from 'react'
import { Link } from 'react-router-dom'

export default function VerifyEmail() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Check Your Email</h1>
        <p className="auth-subtitle">We've sent a verification link to your email address</p>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <img 
              src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=120&h=120&fit=crop&crop=center" 
              alt="Email" 
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '16px', 
                objectFit: 'cover', 
                margin: '0 auto 20px' 
              }}
            />
          </div>
          
          <p style={{ 
            textAlign: 'center', 
            color: '#718096', 
            lineHeight: '1.6', 
            marginBottom: '24px' 
          }}>
            Please click the verification link in your email to activate your account. 
            Once verified, you can sign in and start using HabitFlow.
          </p>
          
          <div style={{ textAlign: 'center' }}>
            <Link 
              to="/login" 
              className="auth-btn" 
              style={{ 
                display: 'inline-block', 
                textDecoration: 'none', 
                marginBottom: '16px' 
              }}
            >
              Go to Sign In
            </Link>
          </div>
          
          <p className="auth-link" style={{ textAlign: 'center' }}>
            Didn't receive the email? Check your spam folder or{' '}
            <Link to="/signup">try signing up again</Link>
          </p>
        </div>
      </div>
    </div>
  )
}