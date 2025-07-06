import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { breakHabits } from '../data/habitsData'
import { useHabits } from '../contexts/HabitContext'

export default function BreakHabits() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const { habits } = useHabits()

  // Filter out habits that are already active
  const activeHabitIds = Object.keys(habits)
  const availableHabits = breakHabits.filter(habit => !activeHabitIds.includes(habit.id))

  const filteredHabits = availableHabits.filter(habit =>
    habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    habit.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleHabitSelect = (habitId) => {
    navigate(`/strategy/${habitId}/break`)
  }

  return (
    <Layout title="Break a Habit" showBackButton={true}>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search habits..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredHabits.length === 0 ? (
        <div className="no-habits-available">
          <div className="no-habits-icon">🎯</div>
          <h3>All Available Habits Started!</h3>
          <p>You've already started working on all the available habits to break. Keep up the great work!</p>
          <button onClick={() => navigate('/my-habits')} className="view-habits-btn">
            View My Active Habits
          </button>
        </div>
      ) : (
        <div className="habits-list">
          {filteredHabits.map((habit) => (
            <div
              key={habit.id}
              className="habit-card"
              onClick={() => handleHabitSelect(habit.id)}
            >
              <img src={habit.image} alt={habit.name} className="habit-image" />
              <div className="habit-info">
                <h4>{habit.name}</h4>
                <p>{habit.description.substring(0, 100)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}