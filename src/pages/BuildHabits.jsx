import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { buildHabits } from '../data/habitsData'

export default function BuildHabits() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const filteredHabits = buildHabits.filter(habit =>
    habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    habit.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleHabitSelect = (habitId) => {
    navigate(`/strategy/${habitId}/build`)
  }

  return (
    <Layout title="Build a Habit" showBackButton={true}>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search habits..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
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
    </Layout>
  )
}