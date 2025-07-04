import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function ReflectionApp() {
  const { 
    getDayReflections, 
    addDayReflection, 
    deleteDayReflection,
    getDayReflectionStreak
  } = useFeatures()

  const [showReflectionModal, setShowReflectionModal] = useState(false)
  const [reflectionForm, setReflectionForm] = useState({
    wentWell: '',
    didntGoWell: '',
    letGo: ''
  })
  const [saving, setSaving] = useState(false)

  const reflections = getDayReflections()
  const reflectionStreak = getDayReflectionStreak()
  const todayReflection = reflections.find(reflection => {
    const reflectionDate = new Date(reflection.timestamp).toDateString()
    const today = new Date().toDateString()
    return reflectionDate === today
  })

  const handleStartReflection = () => {
    if (todayReflection) {
      setReflectionForm({
        wentWell: todayReflection.wentWell,
        didntGoWell: todayReflection.didntGoWell,
        letGo: todayReflection.letGo
      })
    } else {
      setReflectionForm({
        wentWell: '',
        didntGoWell: '',
        letGo: ''
      })
    }
    setShowReflectionModal(true)
  }

  const handleSaveReflection = async () => {
    if (!reflectionForm.wentWell.trim() && !reflectionForm.didntGoWell.trim() && !reflectionForm.letGo.trim()) {
      alert('Please fill in at least one reflection')
      return
    }

    try {
      setSaving(true)
      
      // If updating today's reflection, delete the old one first
      if (todayReflection) {
        deleteDayReflection(todayReflection.id)
      }
      
      addDayReflection({
        wentWell: reflectionForm.wentWell.trim(),
        didntGoWell: reflectionForm.didntGoWell.trim(),
        letGo: reflectionForm.letGo.trim()
      })
      
      setShowReflectionModal(false)
      setReflectionForm({
        wentWell: '',
        didntGoWell: '',
        letGo: ''
      })
    } catch (error) {
      console.error('Error saving reflection:', error)
      alert('Error saving reflection. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteReflection = (reflectionId) => {
    if (window.confirm('Are you sure you want to delete this reflection?')) {
      deleteDayReflection(reflectionId)
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
        weekday: 'long',
        month: 'short', 
        day: 'numeric'
      })
    }
  }

  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <Layout title="🧠 Unpack My Day" showBackButton={true} backTo="/features">
      <div className="reflection-content">
        <div className="reflection-header">
          <div className="reflection-greeting">
            <h2>{getCurrentTimeGreeting()}!</h2>
            <p>Take a moment to reflect on your day</p>
          </div>
          
          <div className="reflection-stats">
            <div className="stat-item">
              <span className="stat-value">{reflections.length}</span>
              <span className="stat-label">Total Reflections</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{reflectionStreak}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
        </div>

        <div className="today-section">
          {todayReflection ? (
            <div className="today-reflection">
              <div className="reflection-card completed">
                <h3>✅ Today's Reflection</h3>
                <div className="reflection-content-display">
                  {todayReflection.wentWell && (
                    <div className="reflection-item">
                      <div className="reflection-question">😊 What went well?</div>
                      <div className="reflection-answer">{todayReflection.wentWell}</div>
                    </div>
                  )}
                  {todayReflection.didntGoWell && (
                    <div className="reflection-item">
                      <div className="reflection-question">😔 What didn't go well?</div>
                      <div className="reflection-answer">{todayReflection.didntGoWell}</div>
                    </div>
                  )}
                  {todayReflection.letGo && (
                    <div className="reflection-item">
                      <div className="reflection-question">🕊️ What can you let go of?</div>
                      <div className="reflection-answer">{todayReflection.letGo}</div>
                    </div>
                  )}
                </div>
                <button 
                  className="edit-reflection-btn"
                  onClick={handleStartReflection}
                >
                  Edit Reflection
                </button>
              </div>
            </div>
          ) : (
            <div className="today-prompt">
              <div className="prompt-card">
                <h3>🌅 Ready to reflect?</h3>
                <p>End your day with mindful reflection and let go of what no longer serves you.</p>
                <button 
                  className="start-reflection-btn"
                  onClick={handleStartReflection}
                >
                  Start Today's Reflection
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="past-reflections">
          <h3>📖 Past Reflections</h3>
          {reflections.length === 0 ? (
            <div className="no-reflections">
              <p>Your reflection journey starts here. Take a moment to unpack your day.</p>
            </div>
          ) : (
            <div className="reflections-list">
              {reflections.slice(0, 10).map(reflection => (
                <div key={reflection.id} className="reflection-history-card">
                  <div className="reflection-header">
                    <div className="reflection-date">{formatDate(reflection.timestamp)}</div>
                    <button 
                      className="delete-reflection-btn"
                      onClick={() => handleDeleteReflection(reflection.id)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="reflection-summary">
                    {reflection.wentWell && (
                      <div className="summary-item positive">
                        <span className="summary-icon">😊</span>
                        <span className="summary-text">{reflection.wentWell.substring(0, 60)}...</span>
                      </div>
                    )}
                    {reflection.didntGoWell && (
                      <div className="summary-item negative">
                        <span className="summary-icon">😔</span>
                        <span className="summary-text">{reflection.didntGoWell.substring(0, 60)}...</span>
                      </div>
                    )}
                    {reflection.letGo && (
                      <div className="summary-item release">
                        <span className="summary-icon">🕊️</span>
                        <span className="summary-text">{reflection.letGo.substring(0, 60)}...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reflection Modal */}
        {showReflectionModal && (
          <div className="modal-overlay" onClick={() => setShowReflectionModal(false)}>
            <div className="modal-content reflection-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🧠 Unpack Your Day</h3>
                <button className="modal-close" onClick={() => setShowReflectionModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="reflection-questions">
                  <div className="question-group">
                    <label htmlFor="wentWell">
                      <span className="question-icon">😊</span>
                      What went well today?
                    </label>
                    <textarea
                      id="wentWell"
                      value={reflectionForm.wentWell}
                      onChange={(e) => setReflectionForm({ ...reflectionForm, wentWell: e.target.value })}
                      placeholder="Celebrate your wins, big or small..."
                      rows="3"
                      className="reflection-textarea positive"
                    />
                  </div>

                  <div className="question-group">
                    <label htmlFor="didntGoWell">
                      <span className="question-icon">😔</span>
                      What didn't go well today?
                    </label>
                    <textarea
                      id="didntGoWell"
                      value={reflectionForm.didntGoWell}
                      onChange={(e) => setReflectionForm({ ...reflectionForm, didntGoWell: e.target.value })}
                      placeholder="It's okay to acknowledge challenges..."
                      rows="3"
                      className="reflection-textarea negative"
                    />
                  </div>

                  <div className="question-group">
                    <label htmlFor="letGo">
                      <span className="question-icon">🕊️</span>
                      What can you let go of today?
                    </label>
                    <textarea
                      id="letGo"
                      value={reflectionForm.letGo}
                      onChange={(e) => setReflectionForm({ ...reflectionForm, letGo: e.target.value })}
                      placeholder="Release what no longer serves you..."
                      rows="3"
                      className="reflection-textarea release"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowReflectionModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveReflection}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : '🌙 Complete Reflection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}