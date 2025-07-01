import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useHabits } from '../contexts/HabitContext'

export default function MyHabits() {
  const navigate = useNavigate()
  const { 
    habits, 
    removeHabit, 
    completeHabit, 
    uncompleteHabit, 
    isHabitCompletedToday 
  } = useHabits()

  const habitsList = Object.values(habits)

  const handleCompleteHabit = (habitId) => {
    if (isHabitCompletedToday(habitId)) {
      uncompleteHabit(habitId)
    } else {
      completeHabit(habitId)
    }
  }

  const handleRemoveHabit = (habitId) => {
    if (window.confirm('Are you sure you want to remove this habit?')) {
      removeHabit(habitId)
    }
  }

  if (habitsList.length === 0) {
    return (
      <Layout title="My Habits">
        <div className="habits-content">
          <div className="no-habits">
            <img 
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&h=120&fit=crop&crop=center" 
              alt="No habits" 
              className="no-habits-image"
            />
            <h3>No Active Habits</h3>
            <p>Start building or breaking habits from the home screen!</p>
            <button onClick={() => navigate('/')} className="start-btn">
              Get Started
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="My Habits">
      <div className="habits-content">
        {habitsList.map((habit) => {
          const isCompleted = isHabitCompletedToday(habit.id)
          
          return (
            <div key={habit.id} className="habit-item">
              <div className="habit-header">
                <div className="habit-header-left">
                  <img 
                    src={habit.image} 
                    alt={habit.name} 
                    className="habit-item-image"
                  />
                  <div>
                    <div className="habit-title">{habit.name}</div>
                    <div className="habit-streak">🔥 {habit.streak || 0} day streak</div>
                  </div>
                </div>
                <button 
                  className="remove-habit-btn"
                  onClick={() => handleRemoveHabit(habit.id)}
                >
                  Remove
                </button>
              </div>
              
              <div className="habit-actions">
                <button
                  className={`action-btn ${habit.type === 'build' ? 'complete' : 'resist'} ${isCompleted ? (habit.type === 'build' ? 'completed' : 'resisted') : ''}`}
                  onClick={() => handleCompleteHabit(habit.id)}
                  disabled={false}
                >
                  {isCompleted 
                    ? (habit.type === 'build' ? 'Completed Today!' : 'Resisted Today!')
                    : (habit.type === 'build' ? 'Mark Complete' : 'Mark Resisted')
                  }
                </button>
                {isCompleted && (
                  <button 
                    className="undo-btn" 
                    onClick={() => handleCompleteHabit(habit.id)}
                  >
                    Undo
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}