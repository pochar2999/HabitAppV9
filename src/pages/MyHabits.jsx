import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import HabitPreferencesModal from '../components/HabitPreferencesModal'
import { useHabits } from '../contexts/HabitContext'
import { getHabitPreferenceConfig, hasCustomPreferences } from '../data/habitPreferences'

export default function MyHabits() {
  const navigate = useNavigate()
  const { 
    habits, 
    removeHabit, 
    completeHabit, 
    uncompleteHabit, 
    isHabitCompletedToday,
    getHabitPreferences
  } = useHabits()

  const [selectedHabit, setSelectedHabit] = useState(null)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)

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

  const handleHabitClick = (habit) => {
    if (hasCustomPreferences(habit.id)) {
      setSelectedHabit(habit)
      setShowPreferencesModal(true)
    }
  }

  const closePreferencesModal = () => {
    setShowPreferencesModal(false)
    setSelectedHabit(null)
  }

  const renderHabitPreferences = (habitId) => {
    const preferences = getHabitPreferences(habitId)
    const config = getHabitPreferenceConfig(habitId)
    
    if (!config || Object.keys(preferences).length === 0) {
      return null
    }

    return (
      <div className="habit-preferences-summary">
        {config.fields.slice(0, 2).map(field => {
          const value = preferences[field.key]
          if (!value) return null
          
          return (
            <div key={field.key} className="preference-item">
              <span className="preference-label">{field.label}:</span>
              <span className="preference-value">{value}</span>
            </div>
          )
        })}
      </div>
    )
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
          const hasPreferences = hasCustomPreferences(habit.id)
          
          return (
            <div key={habit.id} className="habit-item">
              <div className="habit-header">
                <div 
                  className="habit-header-left"
                  onClick={() => handleHabitClick(habit)}
                  style={{ cursor: hasPreferences ? 'pointer' : 'default' }}
                >
                  <img 
                    src={habit.image} 
                    alt={habit.name} 
                    className="habit-item-image"
                  />
                  <div>
                    <div className="habit-title">
                      {habit.name}
                      {hasPreferences && (
                        <span className="preferences-indicator" title="Click to edit preferences">
                          ⚙️
                        </span>
                      )}
                    </div>
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

              {hasPreferences && renderHabitPreferences(habit.id)}
              
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

      {selectedHabit && (
        <HabitPreferencesModal
          isOpen={showPreferencesModal}
          onClose={closePreferencesModal}
          habitId={selectedHabit.id}
          habitName={selectedHabit.name}
          preferenceConfig={getHabitPreferenceConfig(selectedHabit.id)}
        />
      )}
    </Layout>
  )
}