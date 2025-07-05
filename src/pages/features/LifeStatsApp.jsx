import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'
import { useHabits } from '../../contexts/HabitContext'

export default function LifeStatsApp() {
  const { getJournalEntries } = useFeatures()
  const { habits, getWeeklyProgress, getCurrentStreak, reflections } = useHabits()
  
  const [activeView, setActiveView] = useState('overview') // 'overview', 'habits', 'mood', 'consistency'

  // Calculate stats
  const calculateStats = () => {
    const habitsList = Object.values(habits)
    const journalEntries = getJournalEntries()
    const reflectionsList = Object.values(reflections || {})
    
    // Total habits completed
    const totalHabitsCompleted = habitsList.reduce((total, habit) => {
      return total + (habit.totalDays || 0)
    }, 0)

    // Time spent improving (estimate based on habits)
    const timeSpentImproving = habitsList.reduce((total, habit) => {
      const avgTimePerHabit = 15 // minutes
      return total + ((habit.totalDays || 0) * avgTimePerHabit)
    }, 0)

    // Journals written
    const journalsWritten = journalEntries.length + reflectionsList.length

    // Most consistent days
    const dayStats = {}
    habitsList.forEach(habit => {
      if (habit.completedDays) {
        habit.completedDays.forEach(dateStr => {
          const dayOfWeek = new Date(dateStr).getDay()
          dayStats[dayOfWeek] = (dayStats[dayOfWeek] || 0) + 1
        })
      }
    })

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const mostConsistentDays = Object.entries(dayStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day, count]) => ({ day: dayNames[day], count }))

    // Mood trends
    const moodEntries = [
      ...journalEntries.filter(entry => entry.mood),
      ...reflectionsList.filter(reflection => reflection.rating)
    ]
    
    const moodTrend = moodEntries.length > 0 
      ? moodEntries.reduce((sum, entry) => sum + (entry.mood || entry.rating), 0) / moodEntries.length
      : 0

    // Current level (gamification)
    const totalPoints = totalHabitsCompleted + (journalsWritten * 5) + (getCurrentStreak() * 10)
    const level = Math.floor(totalPoints / 100) + 1

    return {
      totalHabitsCompleted,
      timeSpentImproving,
      journalsWritten,
      mostConsistentDays,
      moodTrend,
      level,
      totalPoints,
      currentStreak: getCurrentStreak(),
      activeHabits: habitsList.length
    }
  }

  const stats = calculateStats()

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getMoodEmoji = (rating) => {
    if (rating >= 4.5) return '😄'
    if (rating >= 3.5) return '😊'
    if (rating >= 2.5) return '😐'
    if (rating >= 1.5) return '😕'
    return '😢'
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#48bb78'
    if (percentage >= 60) return '#ed8936'
    if (percentage >= 40) return '#f6ad55'
    return '#fc8181'
  }

  const renderOverview = () => (
    <div className="life-stats-overview">
      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face" 
              alt="Profile" 
            />
            <div className="level-badge">Lv. {stats.level}</div>
          </div>
          <div className="profile-info">
            <h3>Your Growth Journey</h3>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${(stats.totalPoints % 100)}%` }} />
              <span className="xp-text">{stats.totalPoints % 100}/100 XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{stats.totalHabitsCompleted}</div>
          <div className="stat-label">Habits Completed</div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-icon">⏰</div>
          <div className="stat-value">{formatTime(stats.timeSpentImproving)}</div>
          <div className="stat-label">Time Improving</div>
        </div>
        
        <div className="stat-card tertiary">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.journalsWritten}</div>
          <div className="stat-label">Journals Written</div>
        </div>
        
        <div className="stat-card quaternary">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">Current Streak</div>
        </div>
      </div>

      {/* Mood & Consistency */}
      <div className="insights-grid">
        <div className="insight-card">
          <h4>😊 Mood Trend</h4>
          <div className="mood-display">
            <span className="mood-emoji">{getMoodEmoji(stats.moodTrend)}</span>
            <span className="mood-rating">{stats.moodTrend.toFixed(1)}/5</span>
          </div>
          <div className="mood-description">
            {stats.moodTrend >= 4 ? 'Excellent mood!' : 
             stats.moodTrend >= 3 ? 'Good mood overall' : 
             stats.moodTrend >= 2 ? 'Room for improvement' : 'Focus on self-care'}
          </div>
        </div>

        <div className="insight-card">
          <h4>📅 Most Consistent Days</h4>
          <div className="consistency-list">
            {stats.mostConsistentDays.length > 0 ? (
              stats.mostConsistentDays.map((item, index) => (
                <div key={index} className="consistency-item">
                  <span className="day-name">{item.day}</span>
                  <span className="completion-count">{item.count} completions</span>
                </div>
              ))
            ) : (
              <div className="no-data">Start completing habits to see patterns!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderHabitsView = () => {
    const habitsList = Object.values(habits)
    const weeklyProgress = getWeeklyProgress()

    return (
      <div className="habits-stats-view">
        <div className="habits-summary">
          <h3>🎯 Habits Overview</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-value">{stats.activeHabits}</span>
              <span className="summary-label">Active Habits</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{stats.totalHabitsCompleted}</span>
              <span className="summary-label">Total Completed</span>
            </div>
          </div>
        </div>

        <div className="weekly-chart">
          <h4>📊 Weekly Progress</h4>
          <div className="chart-container">
            {weeklyProgress.map((day, index) => (
              <div key={index} className="chart-day">
                <div 
                  className="chart-bar" 
                  style={{ 
                    height: `${Math.max(day.percentage, 5)}%`,
                    backgroundColor: getProgressColor(day.percentage)
                  }}
                />
                <div className="chart-label">{day.day}</div>
                <div className="chart-percentage">{day.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="habits-list">
          <h4>📋 Individual Habits</h4>
          {habitsList.map(habit => (
            <div key={habit.id} className="habit-stat-card">
              <img src={habit.image} alt={habit.name} className="habit-image" />
              <div className="habit-info">
                <div className="habit-name">{habit.name}</div>
                <div className="habit-stats">
                  <span>🔥 {habit.streak || 0} streak</span>
                  <span>✅ {habit.totalDays || 0} total</span>
                  <span>🏆 {habit.bestStreak || 0} best</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Layout title="📊 Life Stats Dashboard" showBackButton={true} backTo="/features">
      <div className="life-stats-content">
        <div className="stats-tabs">
          <button 
            className={`tab-btn ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeView === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveView('habits')}
          >
            Habits
          </button>
        </div>

        {activeView === 'overview' && renderOverview()}
        {activeView === 'habits' && renderHabitsView()}
      </div>
    </Layout>
  )
}