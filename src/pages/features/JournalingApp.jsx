import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function JournalingApp() {
  const { getJournalEntries, addJournalEntry, deleteJournalEntry } = useFeatures()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPastEntries, setShowPastEntries] = useState(false)
  const [entryTitle, setEntryTitle] = useState('')
  const [entryContent, setEntryContent] = useState('')
  const [showMoodStep, setShowMoodStep] = useState(false)
  const [selectedMood, setSelectedMood] = useState(null)
  const [saving, setSaving] = useState(false)

  const entries = getJournalEntries()

  const handleAddEntry = () => {
    setShowAddModal(true)
    setEntryTitle('')
    setEntryContent('')
    setShowMoodStep(false)
    setSelectedMood(null)
  }

  const handleSaveEntry = async () => {
    if (!entryTitle.trim() || !entryContent.trim()) {
      alert('Please enter both title and content')
      return
    }

    try {
      setSaving(true)
      
      if (!showMoodStep) {
        // First step: ask about mood
        setShowMoodStep(true)
        return
      }

      // Second step: save with or without mood
      addJournalEntry(entryTitle.trim(), entryContent.trim(), selectedMood)
      
      // Reset and close
      setShowAddModal(false)
      setEntryTitle('')
      setEntryContent('')
      setShowMoodStep(false)
      setSelectedMood(null)
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Error saving entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkipMood = () => {
    addJournalEntry(entryTitle.trim(), entryContent.trim(), null)
    setShowAddModal(false)
    setEntryTitle('')
    setEntryContent('')
    setShowMoodStep(false)
    setSelectedMood(null)
  }

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteJournalEntry(entryId)
    }
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEntryTitle('')
    setEntryContent('')
    setShowMoodStep(false)
    setSelectedMood(null)
  }

  const getMoodEmoji = (mood) => {
    const emojis = {
      1: '😢',
      2: '😕',
      3: '😐',
      4: '😊',
      5: '😄'
    }
    return emojis[mood] || '😐'
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
    <Layout title="📝 Journaling" showBackButton={true} backTo="/features">
      <div className="journaling-app-content">
        <div className="app-header">
          <button className="add-entry-btn" onClick={handleAddEntry}>
            + New Entry
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="no-entries">
            <div className="no-entries-icon">📝</div>
            <h3>Start Your Journal</h3>
            <p>Capture your thoughts, feelings, and daily experiences</p>
          </div>
        ) : (
          <div className="entries-section">
            <button 
              className="toggle-entries-btn"
              onClick={() => setShowPastEntries(!showPastEntries)}
            >
              {showPastEntries ? 'Hide Entries' : 'Show All Entries'} ({entries.length})
            </button>
            
            {showPastEntries && (
              <div className="entries-list">
                {entries.map((entry) => (
                  <div key={entry.id} className="entry-card">
                    <div className="entry-header">
                      <div className="entry-title">{entry.title}</div>
                      <div className="entry-actions">
                        <div className="entry-date">
                          {formatDate(entry.timestamp)}
                        </div>
                        {entry.mood && (
                          <span className="entry-mood">
                            {getMoodEmoji(entry.mood)}
                          </span>
                        )}
                        <button 
                          className="delete-entry-btn"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="entry-content">
                      {entry.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Entry Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {!showMoodStep ? 'New Journal Entry' : 'Rate Your Mood'}
                </h3>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>
              
              <div className="modal-body">
                {!showMoodStep ? (
                  <div className="entry-form">
                    <div className="form-group">
                      <label htmlFor="entryTitle">Title</label>
                      <input
                        type="text"
                        id="entryTitle"
                        value={entryTitle}
                        onChange={(e) => setEntryTitle(e.target.value)}
                        placeholder="What's this entry about?"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="entryContent">Content</label>
                      <textarea
                        id="entryContent"
                        value={entryContent}
                        onChange={(e) => setEntryContent(e.target.value)}
                        placeholder="Write your thoughts, feelings, or observations..."
                        rows="8"
                        className="entry-textarea"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mood-form">
                    <p className="mood-question">How are you feeling today?</p>
                    <div className="mood-options">
                      {[1, 2, 3, 4, 5].map(mood => (
                        <button
                          key={mood}
                          className={`mood-btn ${selectedMood === mood ? 'selected' : ''}`}
                          onClick={() => setSelectedMood(mood)}
                        >
                          <div className="mood-emoji">{getMoodEmoji(mood)}</div>
                          <div className="mood-label">{mood}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                {!showMoodStep ? (
                  <>
                    <button className="btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={handleSaveEntry}
                      disabled={saving || !entryTitle.trim() || !entryContent.trim()}
                    >
                      {saving ? 'Saving...' : 'Next'}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-secondary" onClick={handleSkipMood}>
                      Skip Mood
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={handleSaveEntry}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Entry'}
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