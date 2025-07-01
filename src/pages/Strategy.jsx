import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useHabits } from '../contexts/HabitContext'
import { habitsData } from '../data/habitsData'

export default function Strategy() {
  const { habitId, type } = useParams()
  const navigate = useNavigate()
  const { addHabit } = useHabits()
  
  const habit = habitsData[habitId]
  const backTo = type === 'build' ? '/build-habits' : '/break-habits'

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
    addHabit(habitId, {
      name: habit.name,
      type: habit.type,
      image: habit.image,
      description: habit.description
    })
    
    navigate('/my-habits')
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
    </Layout>
  )
}