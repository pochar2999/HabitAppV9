import React, { useState } from 'react'
import Layout from '../components/Layout'
import { useHabits } from '../contexts/HabitContext'

export default function Journal() {
  const { getReflections, addReflection, deleteReflection } = useHabits()
  const [showAddModal, setShowAddModal] = useState(false)
  const [reflectionText, setReflectionText] = useState('')
  const [showRatingStep, setShowRatingStep] = useState(false)
  const [selectedRating, setSelectedRating] = useState(null)
  const [saving, setSaving] = useState(false)

  const reflections = getReflections()

  const handleAddReflection = () => {
    setShowAddModal(true)
    setReflectionText('')
    setShowRatingStep(false)
    setSelectedRating(null)
  }

  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) {
      alert('Please enter your reflection')
      return
    }

    try {
      setSaving(true)
      
      if (!showRatingStep) {
        // First step: ask about rating
        setShowRatingStep(true)
        return
      }

      // Second step: save with or without rating
      addReflection(reflectionText.trim(), selectedRating)
      
      // Reset and close
      setShowAddModal(false)
      setReflectionText('')
      setShowRatingStep(false)
      setSelectedRating(null)
    } catch (error) {
      console.error('Error saving reflection:', error)
      alert('Error saving reflection. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkipRating = () => {
    addReflection(reflectionText.trim(), null)
    setShowAddModal(false)
    setReflectionText('')
    setShowRatingStep(false)
    setSelectedRating(null)
  }

  const handleDeleteReflection = (reflectionId) => {
    if (window.confirm('Are you sure you want to delete this reflection?')) {
      deleteReflection(reflectionId)
    }
  }

  const closeModal = () => {
    setShowAddModal(false)
    setReflectionText('')
    setShowRatingStep(false)
    setSelectedRating(null)
  }

  const getRatingEmoji = (rating) => {
    const emojis = {
      1: '😢',
      2: '😕',
      3: '😐',
      4: '😊',
      5: '😄'
    }
    return emojis[rating] || '😐'
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <Layout title="Journal">
      <div className="journal-content">
        <div className="journal-header">
          <button className="add-reflection-btn" onClick={handleAddReflection}>
            + Add Reflection
          </button>
        </div>

        {reflections.length === 0 ? (
          <div className="no-reflections">
            <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=120&h=120&fit=crop&crop=center" 
              alt="No reflections" 
              className="no-reflections-image"
            />
            <h3>No Reflections Yet</h3>
            <p>Start journaling your thoughts and track your daily mood!</p>
          </div>
        ) : (
          <div className="reflections-list">
            {reflections.map((reflection) => (
              <div key={reflection.id} className="reflection-card">
                <div className="reflection-header">
                  <div className="reflection-date">
                    {formatDate(reflection.timestamp)}
                  </div>
                  <div className="reflection-actions">
                    {reflection.rating && (
                      <span className="reflection-rating">
                        {getRatingEmoji(reflection.rating)}
                      </span>
                    )}
                    <button 
                      className="delete-reflection-btn"
                      onClick={() => handleDeleteReflection(reflection.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="reflection-text">
                  {reflection.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Reflection Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {!showRatingStep ? 'Add Reflection' : 'Rate Your Day'}
                </h3>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>
              
              <div className="modal-body">
                {!showRatingStep ? (
                  <div className="reflection-form">
                    <label htmlFor="reflectionText">What's on your mind?</label>
                    <textarea
                      id="reflectionText"
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder="Write your thoughts, feelings, or observations about your day..."
                      rows="6"
                      className="reflection-textarea"
                    />
                  </div>
                ) : (
                  <div className="rating-form">
                    <p className="rating-question">Would you like to add a rating for your day?</p>
                    <div className="rating-options">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          className={`rating-btn ${selectedRating === rating ? 'selected' : ''}`}
                          onClick={() => setSelectedRating(rating)}
                        >
                          <div className="rating-emoji">{getRatingEmoji(rating)}</div>
                          <div className="rating-label">{rating}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                {!showRatingStep ? (
                  <>
                    <button className="btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={handleSaveReflection}
                      disabled={saving || !reflectionText.trim()}
                    >
                      {saving ? 'Saving...' : 'Next'}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-secondary" onClick={handleSkipRating}>
                      Skip Rating
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={handleSaveReflection}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Reflection'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}