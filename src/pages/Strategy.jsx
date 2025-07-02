import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import HabitPreferencesModal from '../components/HabitPreferencesModal'
import { useHabits } from '../contexts/HabitContext'
import { habitsData } from '../data/habitsData'
import { getHabitPreferenceConfig, getHabitCompletionType, getHabitTargetCount } from '../data/habitPreferences'

export default function Strategy() {
  const { habitId, type } = useParams()
  const navigate = useNavigate()
  const { addHabit } = useHabits()
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [habitPreferences, setHabitPreferences] = useState({})
  
  const habit = habitsData[habitId]
  const backTo = type === 'build' ? '/build-habits' : '/break-habits'
  const preferenceConfig = getHabitPreferenceConfig(habitId)

  if (!habit) {
    return (
      <Layout title="Habit Not Found" showBackButton={true} backTo={backTo}>
        <div className="strategy-content">
          <p>Habit not found.</p>
        </div>
      </Layout>
    )
  }

  const handleStartHabit = () => {
    if (preferenceConfig) {
      setShowPreferencesModal(true)
    } else {
      // Add habit without preferences
      addHabitToUser({})
    }
  }

  const addHabitToUser = (preferences) => {
    const completionType = getHabitCompletionType(habitId)
    const targetCount = getHabitTargetCount(habitId, preferences)
    
    addHabit(habitId, {
      name: habit.name,
      type: habit.type,
      image: habit.image,
      description: habit.description,
      completionType,
      targetCount,
      preferences
    })
    
    navigate('/my-habits')
  }

  const handlePreferencesSave = (preferences) => {
    setHabitPreferences(preferences)
    addHabitToUser(preferences)
    setShowPreferencesModal(false)
  }

  return (
    <Layout title={`${habit.name} Strategy`} showBackButton={true} backTo={backTo}>
      <div className="strategy-content">
        <div className="habit-description">
          {habit.description}
        </div>
        
        <div className="methods-section">
          <h3>Recommended Methods</h3>
          {habit.methods.map((method, index) => (
            <div key={index} className="method-card">
              <div className="method-title">{method.title}</div>
              <div className="method-description">{method.description}</div>
            </div>
          ))}
        </div>
        
        {habit.quote && (
          <div className="quote-section">
            <h3>Motivation</h3>
            <blockquote>{habit.quote}</blockquote>
          </div>
        )}
        
        <button className="start-btn" onClick={handleStartHabit}>
          {type === 'build' ? 'Start Habit Plan' : 'Start Breaking Plan'}
        </button>
      </div>

      {preferenceConfig && (
        <HabitPreferencesModal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          habitId={habitId}
          habitName={habit.name}
          preferenceConfig={preferenceConfig}
          onSave={handlePreferencesSave}
          isInitialSetup={true}
        />
      )}
    </Layout>
  )
}