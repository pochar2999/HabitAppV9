import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import HabitPreferencesModal from '../components/HabitPreferencesModal'
import HabitStackBuilder from '../components/HabitStackBuilder'
import { useHabits } from '../contexts/HabitContext'
import { getHabitPreferenceConfig, hasCustomPreferences } from '../data/habitPreferences'
import { habitsData } from '../data/habitsData'

export default function MyHabits() {
  const navigate = useNavigate()
  const { 
    habits, 
    removeHabit, 
    completeHabit, 
    uncompleteHabit,
    isHabitCompletedToday,
    getHabitPreferences,
    getHabitStacks,
    deleteHabitStack
  } = useHabits()

  const [selectedHabit, setSelectedHabit] = useState(null)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showStackBuilder, setShowStackBuilder] = useState(false)
  const [editingStack, setEditingStack] = useState(null)
  const [activeTab, setActiveTab] = useState('habits') // 'habits' or 'stacks'
  const [showMethodsModal, setShowMethodsModal] = useState(false)
  const [selectedHabitMethods, setSelectedHabitMethods] = useState(null)

  const habitsList = Object.values(habits)
  const habitStacks = getHabitStacks()

  const handleCompleteHabit = (habitId) => {
    if (isHabitCompletedToday(habitId)) {
      uncompleteHabit(habitId)
    } else {
      completeHabit(habitId)
    }
  }

  const handleCompleteHabitInStack = (habitId) => {
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

  const handleViewMethods = (habitId) => {
    const habitData = habitsData[habitId]
    if (habitData && habitData.methods) {
      setSelectedHabitMethods(habitData)
      setShowMethodsModal(true)
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

  const closeStackBuilder = () => {
    setShowStackBuilder(false)
    setEditingStack(null)
  }

  const closeMethodsModal = () => {
    setShowMethodsModal(false)
    setSelectedHabitMethods(null)
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

  const getStackProgress = (stack) => {
    const completedCount = stack.habits.filter(habit => 
      isHabitCompletedToday(habit.id)
    ).length
    const totalCount = stack.habits.length
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
    
    return { completedCount, totalCount, percentage }
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
              const isCompleted = isHabitCompletedToday(habit.id)
              const habitData = habitsData[habit.id]
              const hasMethods = habitData && habitData.methods && habitData.methods.length > 0
              
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
                        <div className="habit-streak">{habit.streak || 0} day streak</div>
                      </div>
                    </div>
                    <div className="habit-header-actions">
                      {hasMethods && (
                        <button 
                          className="view-methods-btn"
                          onClick={() => handleViewMethods(habit.id)}
                          title="View habit methods"
                        >
                          📋 Methods
                        </button>
                      )}
                      <button 
                        className="remove-habit-btn"
                        onClick={() => handleRemoveHabit(habit.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {hasPreferences && renderHabitPreferences(habit.id)}
                  
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
              <p className="stacks-description">
                Chain your habits together for better consistency and flow!
              </p>
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
                {habitStacks.map((stack) => {
                  const progress = getStackProgress(stack)
                  
                  return (
                    <div key={stack.id} className="stack-card">
                      <div className="stack-header">
                        <div className="stack-info">
                          <h3 className="stack-name">{stack.name}</h3>
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

                      <div className="stack-progress">
                        <div className="progress-header">
                          <span className="progress-text">
                            Today's Progress: {progress.completedCount}/{progress.totalCount}
                          </span>
                          <span className="progress-percentage">{progress.percentage}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="stack-habits-flow">
                        {stack.habits.map((habit, index) => {
                          const isCompleted = isHabitCompletedToday(habit.id)
                          const habitExists = habits[habit.id] // Check if habit still exists
                          
                          return (
                            <div key={habit.id} className="stack-habit-flow-item">
                              <div className="habit-step">
                                <div className="step-number">{index + 1}</div>
                                <img src={habit.image} alt={habit.name} className="habit-image" />
                                <div className="habit-info">
                                  <div className="habit-name">{habit.name}</div>
                                  {habitExists ? (
                                    <button
                                      className={`complete-btn ${isCompleted ? 'completed' : ''}`}
                                      onClick={() => handleCompleteHabitInStack(habit.id)}
                                    >
                                      {isCompleted ? '✓ Completed' : 'Complete'}
                                    </button>
                                  ) : (
                                    <div className="habit-removed">Habit removed</div>
                                  )}
                                </div>
                              </div>
                              {index < stack.habits.length - 1 && (
                                <div className="flow-arrow">↓</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
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

      <HabitStackBuilder
        isOpen={showStackBuilder}
        onClose={closeStackBuilder}
        editingStack={editingStack}
      />

      {/* Habit Methods Modal */}
      {showMethodsModal && selectedHabitMethods && (
        <div className="modal-overlay" onClick={closeMethodsModal}>
          <div className="modal-content habit-methods-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 {selectedHabitMethods.name} - Methods</h3>
              <button className="modal-close" onClick={closeMethodsModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="habit-methods-content">
                <div className="habit-description">
                  <p>{selectedHabitMethods.description}</p>
                </div>
                
                <div className="methods-section">
                  <h4>Recommended Strategies</h4>
                  {selectedHabitMethods.methods.map((method, index) => (
                    <div key={index} className="method-card">
                      <div className="method-title">{method.title}</div>
                      <div className="method-description">{method.description}</div>
                    </div>
                  ))}
                </div>
                
                {selectedHabitMethods.quote && (
                  <div className="quote-section">
                    <h4>Motivation</h4>
                    <blockquote>{selectedHabitMethods.quote}</blockquote>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-primary" onClick={closeMethodsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}