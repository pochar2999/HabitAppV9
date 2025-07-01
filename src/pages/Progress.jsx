import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useHabits } from '../contexts/HabitContext'

export default function Progress() {
  const navigate = useNavigate()
  const { habits, habitCompletion } = useHabits()
  
  const habitsList = Object.values(habits)

  const getHabitProgress = (habitId) => {
    const habit = habits[habitId]
    if (!habit) return { current: 0, best: 0, success: 0, last7Days: [] }

    // Calculate last 7 days
    const last7Days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const completed = habitCompletion[dateStr]?.includes(habitId) || false
      last7Days.push({
        date: dateStr,
        day: `${date.getDate()}/${date.getMonth() + 1}`,
        completed
      })
    }

    // Calculate success rate (last 30 days)
    let completedDays = 0
    let totalDays = 0
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      if (new Date(dateStr) >= new Date(habit.createdAt?.split('T')[0] || dateStr)) {
        totalDays++
        if (habitCompletion[dateStr]?.includes(habitId)) {
          completedDays++
        }
      }
    }

    const successRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0

    return {
      current: habit.streak || 0,
      best: habit.bestStreak || 0,
      success: successRate,
      last7Days
    }
  }

  if (habitsList.length === 0) {
    return (
      <Layout title="Progress Overview">
        <div className="progress-content">
          <div className="no-progress">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&h=120&fit=crop&crop=center" 
              alt="No progress" 
              className="no-progress-image"
            />
            <h3>No Progress Data</h3>
            <p>Start tracking habits to see your progress!</p>
            <button onClick={() => navigate('/')} className="start-btn">
              Get Started
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Progress Overview">
      <div className="progress-content">
        {habitsList.map((habit) => {
          const progress = getHabitProgress(habit.id)
          
          return (
            <div key={habit.id} className="progress-habit-card">
              <div className="progress-habit-header">
                <img 
                  src={habit.image} 
                  alt={habit.name} 
                  className="progress-habit-image"
                />
                <div>
                  <div className="progress-habit-title">{habit.name}</div>
                  <div className="progress-habit-type">{habit.type} habit</div>
                </div>
              </div>
              
              <div className="progress-stats">
                <div className="progress-stat">
                  <div className="progress-stat-value">{progress.current}</div>
                  <div className="progress-stat-label">Current</div>
                </div>
                <div className="progress-stat">
                  <div className="progress-stat-value">{progress.best}</div>
                  <div className="progress-stat-label">Best</div>
                </div>
                <div className="progress-stat">
                  <div className="progress-stat-value">{progress.success}%</div>
                  <div className="progress-stat-label">Success</div>
                </div>
              </div>
              
              <div className="progress-chart-container">
                <div className="progress-chart-title">Last 7 Days</div>
                <div className="progress-chart-bars">
                  {progress.last7Days.map((day, index) => (
                    <div
                      key={index}
                      className={`chart-bar ${day.completed ? 'completed' : 'missed'}`}
                      style={{ height: day.completed ? '100%' : '20%' }}
                    />
                  ))}
                </div>
                <div className="chart-labels">
                  {progress.last7Days.map((day, index) => (
                    <div key={index}>{day.day}</div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}