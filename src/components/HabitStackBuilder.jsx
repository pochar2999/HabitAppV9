import React, { useState, useEffect } from 'react'
import { useHabits } from '../contexts/HabitContext'
import { habitsData } from '../data/habitsData'

export default function HabitStackBuilder({ isOpen, onClose, editingStack = null }) {
  const { createHabitStack, updateHabitStack, getHabitStacks } = useHabits()
  const [stackName, setStackName] = useState('')
  const [stackDescription, setStackDescription] = useState('')
  const [selectedHabits, setSelectedHabits] = useState([])
  const [availableHabits] = useState(Object.values(habitsData).filter(h => h.type === 'build'))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingStack) {
      setStackName(editingStack.name)
      setStackDescription(editingStack.description || '')
      setSelectedHabits(editingStack.habits || [])
    } else {
      setStackName('')
      setStackDescription('')
      setSelectedHabits([])
    }
  }, [editingStack, isOpen])

  const handleAddHabit = (habit) => {
    if (!selectedHabits.find(h => h.id === habit.id)) {
      setSelectedHabits([...selectedHabits, { ...habit, order: selectedHabits.length }])
    }
  }

  const handleRemoveHabit = (habitId) => {
    setSelectedHabits(selectedHabits.filter(h => h.id !== habitId))
  }

  const handleReorderHabit = (habitId, direction) => {
    const currentIndex = selectedHabits.findIndex(h => h.id === habitId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= selectedHabits.length) return

    const newHabits = [...selectedHabits]
    const [movedHabit] = newHabits.splice(currentIndex, 1)
    newHabits.splice(newIndex, 0, movedHabit)
    
    // Update order values
    newHabits.forEach((habit, index) => {
      habit.order = index
    })
    
    setSelectedHabits(newHabits)
  }

  const handleSave = async () => {
    if (!stackName.trim() || selectedHabits.length === 0) {
      alert('Please enter a stack name and add at least one habit.')
      return
    }

    try {
      setSaving(true)
      const stackData = {
        name: stackName.trim(),
        description: stackDescription.trim(),
        habits: selectedHabits.map((habit, index) => ({
          ...habit,
          order: index
        }))
      }

      if (editingStack) {
        await updateHabitStack(editingStack.id, stackData)
      } else {
        await createHabitStack(stackData)
      }

      onClose()
    } catch (error) {
      console.error('Error saving habit stack:', error)
      alert('Error saving habit stack. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content stack-builder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingStack ? 'Edit Habit Stack' : 'Create Habit Stack'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="stack-form">
            <div className="form-group">
              <label htmlFor="stackName">Stack Name</label>
              <input
                type="text"
                id="stackName"
                value={stackName}
                onChange={(e) => setStackName(e.target.value)}
                placeholder="e.g., Morning Routine, Evening Wind-down"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="stackDescription">Description (Optional)</label>
              <textarea
                id="stackDescription"
                value={stackDescription}
                onChange={(e) => setStackDescription(e.target.value)}
                placeholder="Describe your habit stack..."
                rows="3"
              />
            </div>

            <div className="stack-builder-section">
              <h4>Selected Habits ({selectedHabits.length})</h4>
              {selectedHabits.length === 0 ? (
                <div className="empty-stack">
                  <p>No habits selected. Add habits from the list below.</p>
                </div>
              ) : (
                <div className="selected-habits-list">
                  {selectedHabits.map((habit, index) => (
                    <div key={habit.id} className="stack-habit-item">
                      <div className="habit-order">{index + 1}</div>
                      <img src={habit.image} alt={habit.name} className="habit-image" />
                      <div className="habit-info">
                        <div className="habit-name">{habit.name}</div>
                      </div>
                      <div className="habit-controls">
                        <button
                          className="reorder-btn"
                          onClick={() => handleReorderHabit(habit.id, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="reorder-btn"
                          onClick={() => handleReorderHabit(habit.id, 'down')}
                          disabled={index === selectedHabits.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveHabit(habit.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="available-habits-section">
              <h4>Available Habits</h4>
              <div className="available-habits-grid">
                {availableHabits.map((habit) => {
                  const isSelected = selectedHabits.find(h => h.id === habit.id)
                  return (
                    <div
                      key={habit.id}
                      className={`available-habit-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => !isSelected && handleAddHabit(habit)}
                    >
                      <img src={habit.image} alt={habit.name} className="habit-image" />
                      <div className="habit-name">{habit.name}</div>
                      {isSelected && <div className="selected-indicator">✓</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={saving || !stackName.trim() || selectedHabits.length === 0}
          >
            {saving ? 'Saving...' : (editingStack ? 'Update Stack' : 'Create Stack')}
          </button>
        </div>
      </div>
    </div>
  )
}