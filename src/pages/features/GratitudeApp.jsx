import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function GratitudeApp() {
  const { 
    getGratitudeEntries, 
    addGratitudeEntry, 
    deleteGratitudeEntry,
    getGratitudeStreak
  } = useFeatures()

  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState('wall') // 'wall' or 'list'
  const [gratitudeText, setGratitudeText] = useState('')
  const [saving, setSaving] = useState(false)

  const gratitudeEntries = getGratitudeEntries()
  const gratitudeStreak = getGratitudeStreak()
  const todayEntries = gratitudeEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp).toDateString()
    const today = new Date().toDateString()
    return entryDate === today
  })

  const handleAddGratitude = () => {
    setGratitudeText('')
    setShowAddModal(true)
  }

  const handleSaveGratitude = async () => {
    if (!gratitudeText.trim()) {
      alert('Please enter something you\'re grateful for')
      return
    }

    try {
      setSaving(true)
      
      addGratitudeEntry(gratitudeText.trim())
      
      setShowAddModal(false)
      setGratitudeText('')
    } catch (error) {
      console.error('Error saving gratitude:', error)
      alert('Error saving gratitude. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this gratitude entry?')) {
      deleteGratitudeEntry(entryId)
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const getRandomColor = () => {
    const colors = [
      '#ffeaa7', '#fab1a0', '#fd79a8', '#a29bfe',
      '#74b9ff', '#00cec9', '#55a3ff', '#fdcb6e',
      '#e17055', '#81ecec', '#00b894', '#ffeaa7'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const renderWallView = () => (
    <div className="gratitude-wall">
      <div className="wall-grid">
        {gratitudeEntries.map((entry, index) => (
          <div 
            key={entry.id} 
            className="gratitude-note"
            style={{ 
              backgroundColor: getRandomColor(),
              transform: `rotate(${(index % 3 - 1) * 2}deg)`
            }}
          >
            <div className="note-content">
              {entry.text}
            </div>
            <div className="note-footer">
              <div className="note-date">{formatDate(entry.timestamp)}</div>
              <button 
                className="delete-note-btn"
                onClick={() => handleDeleteEntry(entry.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderListView = () => (
    <div className="gratitude-list">
      {gratitudeEntries.map(entry => (
        <div key={entry.id} className="gratitude-list-item">
          <div className="list-item-content">
            <div className="gratitude-text">{entry.text}</div>
            <div className="gratitude-date">{formatDate(entry.timestamp)}</div>
          </div>
          <button 
            className="delete-list-btn"
            onClick={() => handleDeleteEntry(entry.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )

  return (
    <Layout title="🙏 Gratitude Wall" showBackButton={true} backTo="/features">
      <div className="gratitude-content">
        <div className="gratitude-header">
          <div className="gratitude-stats">
            <div className="stat-item">
              <span className="stat-value">{gratitudeEntries.length}</span>
              <span className="stat-label">Total Gratitudes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{gratitudeStreak}</span>
              <span className="stat-label">Day Streak</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{todayEntries.length}</span>
              <span className="stat-label">Today</span>
            </div>
          </div>

          <div className="gratitude-controls">
            <button className="add-gratitude-btn" onClick={handleAddGratitude}>
              + Add Gratitude
            </button>
            
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'wall' ? 'active' : ''}`}
                onClick={() => setViewMode('wall')}
              >
                🧱 Wall
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋 List
              </button>
            </div>
          </div>
        </div>

        {gratitudeEntries.length === 0 ? (
          <div className="no-gratitude">
            <div className="no-gratitude-icon">🙏</div>
            <h3>Start Your Gratitude Practice</h3>
            <p>Take a moment to appreciate the good things in your life</p>
            <button className="start-gratitude-btn" onClick={handleAddGratitude}>
              Add Your First Gratitude
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'wall' && renderWallView()}
            {viewMode === 'list' && renderListView()}
          </>
        )}

        {/* Add Gratitude Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content gratitude-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🙏 What are you grateful for?</h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="gratitude-prompt">
                  <p>Take a moment to reflect on something positive in your life...</p>
                </div>
                
                <textarea
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value)}
                  placeholder="I'm grateful for..."
                  rows="4"
                  className="gratitude-input"
                  autoFocus
                />
                
                <div className="gratitude-examples">
                  <p>Examples:</p>
                  <ul>
                    <li>My morning coffee and quiet moments</li>
                    <li>A friend who listened when I needed to talk</li>
                    <li>The beautiful sunset I saw today</li>
                    <li>Having a roof over my head</li>
                  </ul>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveGratitude}
                  disabled={saving || !gratitudeText.trim()}
                >
                  {saving ? 'Saving...' : '💝 Save Gratitude'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}