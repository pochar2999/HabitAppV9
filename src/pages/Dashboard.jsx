import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useHabits } from '../contexts/HabitContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { habits, getWeeklyProgress, getCurrentStreak } = useHabits()
  
  const habitsList = Object.values(habits)
  const weeklyProgress = getWeeklyProgress()
  const currentStreak = getCurrentStreak()
  
  // Calculate today's completion rate
  const today = new Date().toDateString()
  const todayCompletedHabits = habitsList.filter(habit => 
    habit.completedDays && habit.completedDays.includes(today)
  ).length
  const todayCompletionRate = habitsList.length > 0 ? Math.round((todayCompletedHabits / habitsList.length) * 100) : 0

  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    if (habitsList.length === 0) {
      return "Ready to start your journey? Let's build some amazing habits!"
    }
    if (todayCompletionRate === 100) {
      return "🎉 Perfect day! You've completed all your habits!"
    }
    if (todayCompletionRate >= 75) {
      return "🔥 You're crushing it! Keep up the momentum!"
    }
    if (todayCompletionRate >= 50) {
      return "💪 Great progress! You're more than halfway there!"
    }
    if (todayCompletedHabits > 0) {
      return "✨ Good start! Every step counts towards your goals!"
    }
    return "🌅 A new day, a fresh start! You've got this!"
  }

  const getStreakMessage = () => {
    if (currentStreak === 0) {
      return "Start your streak today!"
    }
    if (currentStreak === 1) {
      return "Great start! Keep it going!"
    }
    if (currentStreak < 7) {
      return `${currentStreak} days strong! 💪`
    }
    if (currentStreak < 30) {
      return `${currentStreak} days! You're building momentum! 🚀`
    }
    return `${currentStreak} days! You're a habit master! 🏆`
  }

  return (
    <Layout>
      <div className="home-content">
        {/* Progress Overview */}
        {habitsList.length > 0 && (
          <div className="progress-overview">
            <div className="daily-progress">
              <div className="progress-circle-container">
                <div className="progress-circle-large">
                  <svg width="120" height="120" className="progress-svg">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#48bb78"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - todayCompletionRate / 100)}`}
                      transform="rotate(-90 60 60)"
                      className="progress-stroke"
                    />
                  </svg>
                  <div className="progress-text-large">
                    <div className="progress-percentage-large">{todayCompletionRate}%</div>
                    <div className="progress-label-large">Today</div>
                  </div>
                </div>
              </div>
              
              <div className="progress-details">
                <h2 className="motivational-message">{getMotivationalMessage()}</h2>
                <div className="progress-stats">
                  <div className="stat-item">
                    <span className="stat-number">{todayCompletedHabits}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{habitsList.length - todayCompletedHabits}</span>
                    <span className="stat-label">Remaining</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{currentStreak}</span>
                    <span className="stat-label">Day Streak</span>
                  </div>
                </div>
                <div className="streak-message">{getStreakMessage()}</div>
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="weekly-chart-container">
              <h3>This Week's Progress</h3>
              <div className="weekly-chart">
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="chart-day">
                    <div 
                      className="chart-bar" 
                      style={{ 
                        height: `${Math.max(day.percentage, 5)}%`,
                        backgroundColor: day.percentage >= 80 ? '#48bb78' : 
                                       day.percentage >= 50 ? '#ed8936' : 
                                       day.percentage > 0 ? '#f6ad55' : '#e2e8f0'
                      }}
                    />
                    <div className="chart-day-label">{day.day}</div>
                    <div className="chart-percentage">{day.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="action-cards">
          <div 
            className="habit-flow-card build-card" 
            onClick={() => navigate('/build-habits')}
          >
            <div className="card-background">
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center" 
                alt="Build Habits" 
                className="card-image"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">🌱</div>
              <h3>Build a Habit</h3>
              <p>Start forming positive habits with proven methods</p>
              <div className="card-cta">Get Started →</div>
            </div>
          </div>
          
          <div 
            className="habit-flow-card break-card" 
            onClick={() => navigate('/break-habits')}
          >
            <div className="card-background">
              <img 
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center" 
                alt="Break Habits" 
                className="card-image"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">🎯</div>
              <h3>Break a Habit</h3>
              <p>Overcome unwanted behaviors with targeted strategies</p>
              <div className="card-cta">Start Now →</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {habitsList.length > 0 && (
          <div className="quick-actions-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/my-habits')}
              >
                <span className="action-icon">📋</span>
                <div className="action-content">
                  <div className="action-title">My Habits</div>
                  <div className="action-subtitle">{habitsList.length} active</div>
                </div>
              </button>
              
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/progress')}
              >
                <span className="action-icon">📈</span>
                <div className="action-content">
                  <div className="action-title">Progress</div>
                  <div className="action-subtitle">View analytics</div>
                </div>
              </button>
              
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/features')}
              >
                <span className="action-icon">🛠️</span>
                <div className="action-content">
                  <div className="action-title">Features</div>
                  <div className="action-subtitle">Explore tools</div>
                </div>
              </button>
              
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/my-community')}
              >
                <span className="action-icon">👥</span>
                <div className="action-content">
                  <div className="action-title">Community</div>
                  <div className="action-subtitle">Connect & share</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Getting Started Section for New Users */}
        {habitsList.length === 0 && (
          <div className="getting-started">
            <div className="welcome-message">
              <h2>Welcome to HabitFlow! 🎉</h2>
              <p>Your journey to better habits starts here. Choose what you'd like to work on:</p>
            </div>
            
            <div className="starter-suggestions">
              <div className="suggestion-category">
                <h4>🌱 Popular Habits to Build</h4>
                <div className="suggestion-list">
                  <div className="suggestion-item" onClick={() => navigate('/build-habits')}>
                    <span className="suggestion-icon">💧</span>
                    <span className="suggestion-text">Drink More Water</span>
                  </div>
                  <div className="suggestion-item" onClick={() => navigate('/build-habits')}>
                    <span className="suggestion-icon">🧘</span>
                    <span className="suggestion-text">Daily Meditation</span>
                  </div>
                  <div className="suggestion-item" onClick={() => navigate('/build-habits')}>
                    <span className="suggestion-icon">📚</span>
                    <span className="suggestion-text">Read Daily</span>
                  </div>
                </div>
              </div>
              
              <div className="suggestion-category">
                <h4>🎯 Common Habits to Break</h4>
                <div className="suggestion-list">
                  <div className="suggestion-item" onClick={() => navigate('/break-habits')}>
                    <span className="suggestion-icon">📱</span>
                    <span className="suggestion-text">Excessive Phone Use</span>
                  </div>
                  <div className="suggestion-item" onClick={() => navigate('/break-habits')}>
                    <span className="suggestion-icon">⏰</span>
                    <span className="suggestion-text">Procrastination</span>
                  </div>
                  <div className="suggestion-item" onClick={() => navigate('/break-habits')}>
                    <span className="suggestion-icon">🍟</span>
                    <span className="suggestion-text">Junk Food</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}