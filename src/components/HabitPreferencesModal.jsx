import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHabits } from '../contexts/HabitContext'
import { getHabitTargetCount } from '../data/habitPreferences'

export default function HabitPreferencesModal({ 
  isOpen, 
  onClose, 
  habitId, 
  habitName,
  preferenceConfig,
  onSave = null,
  isInitialSetup = false
}) {
  const { currentUser, updateUserData, getUserData } = useAuth()
  const { loadUserData, updateHabitPreferences } = useHabits()
  const [preferences, setPreferences] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load existing preferences when modal opens
  useEffect(() => {
    if (isOpen && habitId && !isInitialSetup) {
      loadPreferences()
    } else if (isOpen && isInitialSetup) {
      // Initialize with default values for initial setup
      const initialPrefs = {}
      preferenceConfig.fields.forEach(field => {
        initialPrefs[field.key] = field.defaultValue || ''
      })
      setPreferences(initialPrefs)
    }
  }, [isOpen, habitId, isInitialSetup])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const userData = await getUserData(currentUser.uid)
      const habitPrefs = userData?.habitPreferences?.[habitId] || {}
      
      // Initialize with default values if no preferences exist
      const initialPrefs = {}
      preferenceConfig.fields.forEach(field => {
        initialPrefs[field.key] = habitPrefs[field.key] || field.defaultValue || ''
      })
      
      setPreferences(initialPrefs)
    } catch (error) {
      console.error('Error loading preferences:', error)
      // Initialize with defaults on error
      const defaultPrefs = {}
      preferenceConfig.fields.forEach(field => {
        defaultPrefs[field.key] = field.defaultValue || ''
      })
      setPreferences(defaultPrefs)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      if (isInitialSetup && onSave) {
        // For initial setup, just call the onSave callback
        onSave(preferences)
      } else {
        // For editing existing preferences
        updateHabitPreferences(habitId, preferences)
        onClose()
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Error saving preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const renderField = (field) => {
    const value = preferences[field.key] || ''

    switch (field.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.key, parseInt(e.target.value) || 0)}
            min={field.min || 0}
            max={field.max || 999}
            className="preference-input"
          />
        )
      
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="preference-input"
          />
        )
      
      case 'time-list':
        return (
          <div className="time-list-container">
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="preference-textarea"
              rows="3"
            />
            <small className="field-hint">
              Enter times separated by commas (e.g., 9:00 AM, 12:00 PM, 3:00 PM)
            </small>
          </div>
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className="preference-select"
          >
            <option value="">Select {field.label}</option>
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className="preference-input"
          />
        )
    }
  }

  if (!isOpen) return null

  const targetCount = getHabitTargetCount(habitId, preferences)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isInitialSetup ? `Set up ${habitName}` : `${habitName} Preferences`}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">Loading preferences...</div>
          ) : (
            <div className="preferences-form">
              {preferenceConfig.fields.map((field) => (
                <div key={field.key} className="preference-field">
                  <label className="preference-label">
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  {field.description && (
                    <p className="field-description">{field.description}</p>
                  )}
                  {renderField(field)}
                </div>
              ))}
              
              {preferenceConfig.completionType === 'multi' && (
                <div className="completion-info">
                  <p className="completion-note">
                    📊 This habit will track <strong>{targetCount}</strong> completions per day.
                    You can tap multiple times to track your progress!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : (isInitialSetup ? 'Start Habit' : 'Save Preferences')}
          </button>
        </div>
      </div>
    </div>
  )
}