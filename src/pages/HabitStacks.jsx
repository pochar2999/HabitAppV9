import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import HabitStackBuilder from '../components/HabitStackBuilder'
import { useHabits } from '../contexts/HabitContext'

export default function HabitStacks() {
  const navigate = useNavigate()
  const { 
    habits,
    getHabitStacks, 
    deleteHabitStack,
    completeHabit,
    uncompleteHabit,
    isHabitCompletedToday
  } = useHabits()

  const [showStackBuilder, setShowStackBuilder] = useState(false)
  const [editingStack, setEditingStack] = useState(null)

  const habitStacks = getHabitStacks()
  const habitsList = Object.values(habits)

  const handleCreateStack = () => {
    setEditingStack(null)
    setShowStackBuilder(true)
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

  const handleCompleteHabitInStack = (habitId) => {
    if (isHabitCompletedToday(habitId)) {
      uncompleteHabit(habitId)
    } else {
      completeHabit(habitId)
    }
  }

  const closeStackBuilder = () => {
    setShowStackBuilder(false)
    setEditingStack(null)
  }

  const getStackProgress = (stack) => {
    const completedCount = stack.habits.filter(habit => 
      isHabitCompletedToday(habit.id)
    ).length
    const totalCount = stack.habits.length
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
    
    return { completedCount, totalCount, percentage }
  }

  if (habitsList.length === 0) {
    return (
      <Layout title="Habit Stacks">
        <div className="stacks-content">
          <div className="no-habits">
            <img 
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&h=120&fit=crop&crop=center" 
              alt="No habits" 
              className="no-habits-image"
            />
            <h3>No Active Habits</h3>
            <p>You need to have active habits before creating stacks!</p>
            <button onClick={() => navigate('/')} className="start-btn">
              Add Some Habits First
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Habit Stacks">
      <div className="stacks-content">
        <div className="stacks-header">
          <button className="create-stack-btn" onClick={handleCreateStack}>
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
            <p>Create your first habit stack to chain multiple habits together!</p>
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

        <HabitStackBuilder
          isOpen={showStackBuilder}
          onClose={closeStackBuilder}
          editingStack={editingStack}
        />
      </div>
    </Layout>
  )
}