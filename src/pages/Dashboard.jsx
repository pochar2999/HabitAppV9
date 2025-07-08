import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useHabits } from '../contexts/HabitContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { habits } = useHabits()

  // Calculate today's progress
  const getTodaysProgress = () => {
    const habitsList = Object.values(habits)
    const totalHabits = habitsList.length
    
    if (totalHabits === 0) {
      return { completed: 0, total: 0, percentage: 0 }
    }

    const today = new Date().toDateString()
    const completedToday = habitsList.filter(habit => 
      habit.completedDays && habit.completedDays.includes(today)
    ).length

    const percentage = Math.round((completedToday / totalHabits) * 100)
    
    return { completed: completedToday, total: totalHabits, percentage }
  }

  const progress = getTodaysProgress()

  return (
    <Layout>
      <div className="dashboard-content">
        {/* Top Section - Action Buttons */}
        <div className="action-buttons-section">
          <div 
            className="action-button build-button" 
            onClick={() => navigate('/build-habits')}
          >
            <div className="button-icon">🌱</div>
            <div className="button-content">
              <h3>Build Habit</h3>
              <p>Start a new positive habit to grow.</p>
            </div>
          </div>
          
          <div 
            className="action-button break-button" 
            onClick={() => navigate('/break-habits')}
          >
            <div className="button-icon">🔥</div>
            <div className="button-content">
              <h3>Break Habit</h3>
              <p>Eliminate a habit holding you back.</p>
            </div>
          </div>
        </div>

        {/* Middle Section - Today's Progress */}
        <div className="progress-section">
          <h2 className="progress-title">Today's Progress</h2>
          <div className="progress-circle-container">
            <div className="progress-circle">
              <svg width="160" height="160" className="progress-svg">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="none"
                  className="progress-bg"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress.percentage / 100)}`}
                  className="progress-fill"
                  transform="rotate(-90 80 80)"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#667eea" stopOpacity="1" />
                    <stop offset="50%" stopColor="#764ba2" stopOpacity="1" />
                    <stop offset="100%" stopColor="#48bb78" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="progress-content">
                <div className="progress-percentage">{progress.percentage}%</div>
                <div className="progress-fraction">{progress.completed}/{progress.total} Habits Done</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}