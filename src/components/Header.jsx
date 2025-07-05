import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useHabits } from '../contexts/HabitContext'
import WeeklyProgress from './WeeklyProgress'

export default function Header({ title, showBackButton = false, backTo = "/" }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout } = useAuth()
  const { getActiveHabitsCount, getCurrentStreak } = useHabits()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'
  const activeHabits = getActiveHabitsCount()
  const currentStreak = getCurrentStreak()

  // Check if we're in a feature app
  const isFeatureApp = location.pathname.startsWith('/features/') && location.pathname !== '/features'

  return (
    <header className="header">
      <div className="header-content">
        {(showBackButton || isFeatureApp) && (
          <button className="back-btn" onClick={() => navigate(isFeatureApp ? '/features' : backTo)}>
            ← Back
          </button>
        )}
        
        {title ? (
          <h2 style={{ fontSize: '24px', fontWeight: '600' }}>{title}</h2>
        ) : (
          <>
            <h1 className="app-title">HabitFlow</h1>
            <div className="greeting">Welcome back, {displayName}!</div>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-number">{currentStreak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{activeHabits}</span>
                <span className="stat-label">Active Habits</span>
              </div>
            </div>
            <WeeklyProgress />
          </>
        )}

        <div className="profile-container">
          <button 
            className="profile-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
              alt="Profile" 
              className="profile-avatar"
            />
          </button>
          <div className={`profile-dropdown ${showDropdown ? 'show' : ''}`}>
            <div className="profile-info">
              <div className="profile-name">{displayName}</div>
              <div className="profile-email">{currentUser?.email}</div>
            </div>
            <hr className="profile-divider" />
            <button className="logout-btn" onClick={handleLogout}>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}