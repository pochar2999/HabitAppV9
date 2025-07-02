import React, { useState } from 'react'
import { useHabits } from '../contexts/HabitContext'

export default function HabitAnalyticsModal({ 
  isOpen, 
  onClose, 
  habitId, 
  habitName 
}) {
  const { logHabitAnalytics } = useHabits()
  const [analytics, setAnalytics] = useState({
    moodBefore: 3,
    moodAfter: 3,
    effort: 3,
    trigger: '',
    notes: ''
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      await logHabitAnalytics(habitId, analytics)
      onClose()
      // Reset form
      setAnalytics({
        moodBefore: 3,
        moodAfter: 3,
        effort: 3,
        trigger: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error saving analytics:', error)
      alert('Error saving analytics. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const moodLabels = {
    1: '😢 Very Low',
    2: '😕 Low', 
    3: '😐 Neutral',
    4: '😊 Good',
    5: '😄 Excellent'
  }

  const effortLabels = {
    1: '😌 Very Easy',
    2: '🙂 Easy',
    3: '😐 Moderate', 
    4: '😅 Hard',
    5: '😰 Very Hard'
  }

  const triggerOptions = [
    { value: 'time', label: '⏰ Time-based (alarm, schedule)' },
    { value: 'location', label: '📍 Location-based (home, gym, etc.)' },
    { value: 'emotion', label: '💭 Emotional (stress, boredom, etc.)' },
    { value: 'social', label: '👥 Social (friend, family influence)' },
    { value: 'visual', label: '👁️ Visual cue (reminder, object)' },
    { value: 'routine', label: '🔄 Part of existing routine' },
    { value: 'other', label: '🤔 Other' }
  ]

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>How did {habitName} go?</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="analytics-form">
            <div className="analytics-section">
              <label className="analytics-label">How did you feel BEFORE?</label>
              <div className="mood-scale">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    className={`mood-btn ${analytics.moodBefore === value ? 'selected' : ''}`}
                    onClick={() => setAnalytics({...analytics, moodBefore: value})}
                  >
                    <div className="mood-emoji">{moodLabels[value].split(' ')[0]}</div>
                    <div className="mood-label">{moodLabels[value].split(' ').slice(1).join(' ')}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="analytics-section">
              <label className="analytics-label">How did you feel AFTER?</label>
              <div className="mood-scale">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    className={`mood-btn ${analytics.moodAfter === value ? 'selected' : ''}`}
                    onClick={() => setAnalytics({...analytics, moodAfter: value})}
                  >
                    <div className="mood-emoji">{moodLabels[value].split(' ')[0]}</div>
                    <div className="mood-label">{moodLabels[value].split(' ').slice(1).join(' ')}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="analytics-section">
              <label className="analytics-label">How much effort did it take?</label>
              <div className="effort-scale">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    className={`effort-btn ${analytics.effort === value ? 'selected' : ''}`}
                    onClick={() => setAnalytics({...analytics, effort: value})}
                  >
                    <div className="effort-emoji">{effortLabels[value].split(' ')[0]}</div>
                    <div className="effort-label">{effortLabels[value].split(' ').slice(1).join(' ')}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="analytics-section">
              <label className="analytics-label">What triggered you to do this habit?</label>
              <div className="trigger-options">
                {triggerOptions.map(option => (
                  <button
                    key={option.value}
                    className={`trigger-btn ${analytics.trigger === option.value ? 'selected' : ''}`}
                    onClick={() => setAnalytics({...analytics, trigger: option.value})}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="analytics-section">
              <label className="analytics-label">Additional Notes (Optional)</label>
              <textarea
                value={analytics.notes}
                onChange={(e) => setAnalytics({...analytics, notes: e.target.value})}
                placeholder="Any additional thoughts or observations..."
                className="analytics-textarea"
                rows="3"
              />
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Skip
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Reflection'}
          </button>
        </div>
      </div>
    </div>
  )
}