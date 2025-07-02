import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHabits } from '../contexts/HabitContext'

export default function HabitPreferencesModal({ 
  isOpen, 
  onClose, 
  habitId, 
  habitName,
  preferenceConfig 
}) {
  const { currentUser, updateUserData } = useAuth()
  const { loadUserData } = useHabits()
  const [preferences, setPreferences] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load existing preferences when modal opens
  useEffect(() => {
    if (isOpen && habitId) {
      loadPreferences()
    }
  }, [isOpen, habitId])

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
      
      // Get current user data
      const userData = await getUserData(currentUser.uid) || {}
      
      // Update habit preferences
      const updatedPreferences = {
        ...userData.habitPreferences,
        [habitId]: {
          ...preferences,
          lastUpdated: new Date().toISOString()
        }
      }

      // Save to Firestore
      await updateUserData(currentUser.uid, {
        habitPreferences: updatedPreferences
      })

      // Reload user data to sync with context
      await loadUserData()
      
      onClose()
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{habitName} Preferences</h3>
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
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}