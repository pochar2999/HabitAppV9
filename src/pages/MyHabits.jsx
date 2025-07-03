import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import HabitPreferencesModal from '../components/HabitPreferencesModal'
import HabitAnalyticsModal from '../components/HabitAnalyticsModal'
import HabitStackBuilder from '../components/HabitStackBuilder'
import { useHabits } from '../contexts/HabitContext'
import { getHabitPreferenceConfig, hasCustomPreferences } from '../data/habitPreferences'

export default function MyHabits() {
  const navigate = useNavigate()
  const { 
    habits, 
    removeHabit, 
    completeHabit, 
    uncompleteHabit, 
    updateHabitProgress,
    isHabitCompletedToday,
    getHabitProgressToday,
    getHabitPreferences,
    getHabitStacks,
    deleteHabitStack
  } = useHabits()

  const [selectedHabit, setSelectedHabit] = useState(null)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [showStackBuilder, setShowStackBuilder] = useState(false)
  const [editingStack, setEditingStack] = useState(null)
  const [activeTab, setActiveTab] = useState('habits') // 'habits' or 'stacks'

  const habitsList = Object.values(habits)
  const habitStacks = getHabitStacks()

  const handleCompleteHabit = (habitId) => {
    const habit = habits[habitId]
    if (!habit) return

    if (habit.completionType === 'multi') {
      const progress = getHabitProgressToday(habitId)
      if (progress.completed) {
        // If already completed, undo the completion
        uncompleteHabit(habitId)
      } else {
        // For multi-completion habits, don't show analytics on individual taps
        // Only show when the full habit is completed via progress buttons
        if (isHabitCompletedToday(habitId)) {
          uncompleteHabit(habitId)
        } else {
          completeHabit(habitId)
          setSelectedHabit(habit)
          setShowAnalyticsModal(true)
        }
      }
    } else {
      if (isHabitCompletedToday(habitId)) {
        uncompleteHabit(habitId)
      } else {
        // Don't complete here - let the analytics modal handle it
        setSelectedHabit(habit)
        setShowAnalyticsModal(true)
      }
    }
  }

  const handleProgressTap = (habitId, targetProgress) => {
    const currentProgress = getHabitProgressToday(habitId)
    
    // Set progress to the tapped button number
    const progressDiff = targetProgress - currentProgress.current
    if (progressDiff > 0) {
      updateHabitProgress(habitId, progressDiff)
      
      // Check if this tap completed the habit
      if (targetProgress >= currentProgress.target) {
        const habit = habits[habitId]
        setSelectedHabit(habit)
        setShowAnalyticsModal(true)
      }
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

  const handleEditStack = (stack) => {
    setEditingStack(stack)
    setShowStackBuilder(true)
  }

  const handleDeleteStack = (stackId) => {
    if (window.confirm('Are you sure you want to delete this habit stack?')) {
      deleteHabitStack(stackId)
    }
  }

  const closePreferencesModal = () => {
    setShowPreferencesModal(false)
    setSelectedHabit(null)
  }

  const closeAnalyticsModal = () => {
    setShowAnalyticsModal(false)
    setSelectedHabit(null)
  }

  const closeStackBuilder = () => {
    setShowStackBuilder(false)
    setEditingStack(null)
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

  const renderProgressButtons = (habit) => {
    const progress = getHabitProgressToday(habit.id)
    
    if (habit.completionType === 'multi') {
      return (
        <div className="multi-progress-container">
          <div className="progress-info">
            <span className="progress-text">
              {progress.current} / {progress.target} completed
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(progress.current / progress.target) * 100}%` }}
              />
            </div>
          </div>
          <div className="progress-buttons">
            {Array.from({ length: progress.target }, (_, index) => (
              <button
                key={index}
                className={`progress-btn ${index < progress.current ? 'completed' : ''}`}
                onClick={() => index >= progress.current ? handleProgressTap(habit.id, index + 1) : null}
                disabled={index < progress.current}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {progress.completed && (
            <button 
              className="undo-btn" 
              onClick={() => uncompleteHabit(habit.id)}
            >
              Reset Today
            </button>
          )}
        </div>
      )
    } else {
      const isCompleted = isHabitCompletedToday(habit.id)
      return (
        <div className="habit-actions">
          <button
            className={`action-btn ${habit.type === 'build' ? 'complete' : 'resist'} ${isCompleted ? (habit.type === 'build' ? 'completed' : 'resisted') : ''}`}
            onClick={() => handleCompleteHabit(habit.id)}
          >
            {isCompleted 
              ? (habit.type === 'build' ? 'Completed Today!' : 'Resisted Today!')
              : (habit.type === 'build' ? 'Mark Complete' : 'Mark Resisted')
            }
          </button>
          {isCompleted && (
            <button 
              className="undo-btn" 
              onClick={() => uncompleteHabit(habit.id)}
            >
              Undo
            </button>
          )}
        </div>
      )
    }
  }

  if (habitsList.length === 0 && habitStacks.length === 0) {
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
        <div className="habits-tabs">
          <button 
            className={`tab-btn ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            Individual Habits ({habitsList.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stacks' ? 'active' : ''}`}
            onClick={() => setActiveTab('stacks')}
          >
            Habit Stacks ({habitStacks.length})
          </button>
        </div>

        {activeTab === 'habits' && (
          <div className="habits-tab-content">
            {habitsList.map((habit) => {
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
                  
                  {renderProgressButtons(habit)}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'stacks' && (
          <div className="stacks-tab-content">
            <div className="stacks-header">
              <button 
                className="create-stack-btn"
                onClick={() => setShowStackBuilder(true)}
              >
                + Create New Stack
              </button>
            </div>

            {habitStacks.length === 0 ? (
              <div className="no-stacks">
                <img 
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&h=120&fit=crop&crop=center" 
                  alt="No stacks" 
                  className="no-stacks-image"
                />
                <h3>No Habit Stacks</h3>
                <p>Create habit stacks to chain multiple habits together!</p>
              </div>
            ) : (
              <div className="stacks-list">
                {habitStacks.map((stack) => (
                  <div key={stack.id} className="stack-item">
                    <div className="stack-header">
                      <div className="stack-info">
                        <h4 className="stack-name">{stack.name}</h4>
                        {stack.description && (
                          <p className="stack-description">{stack.description}</p>
                        )}
                        <div className="stack-meta">
                          {stack.habits.length} habits • Created {new Date(stack.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="stack-actions">
                        <button 
                          className="edit-stack-btn"
                          onClick={() => handleEditStack(stack)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-stack-btn"
                          onClick={() => handleDeleteStack(stack.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="stack-habits">
                      {stack.habits.map((habit, index) => (
                        <div key={habit.id} className="stack-habit">
                          <div className="habit-order">{index + 1}</div>
                          <img src={habit.image} alt={habit.name} className="habit-image" />
                          <div className="habit-name">{habit.name}</div>
                          {index < stack.habits.length - 1 && <div className="habit-arrow">→</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedHabit && (
        <>
          <HabitPreferencesModal
            isOpen={showPreferencesModal}
            onClose={closePreferencesModal}
            habitId={selectedHabit.id}
            habitName={selectedHabit.name}
            preferenceConfig={getHabitPreferenceConfig(selectedHabit.id)}
          />
          
          <HabitAnalyticsModal
            isOpen={showAnalyticsModal}
            onClose={closeAnalyticsModal}
            habitId={selectedHabit.id}
            habitName={selectedHabit.name}
          />
        </>
      )}

      <HabitStackBuilder
        isOpen={showStackBuilder}
        onClose={closeStackBuilder}
        editingStack={editingStack}
      />
    </Layout>
  )
}