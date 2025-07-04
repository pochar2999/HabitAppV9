import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function FutureLettersApp() {
  const { 
    getFutureLetters, 
    addFutureLetter, 
    getDeliveredLetters,
    markLetterAsRead
  } = useFeatures()

  const [activeTab, setActiveTab] = useState('write') // 'write', 'pending', 'delivered'
  const [letterForm, setLetterForm] = useState({
    title: '',
    content: '',
    deliveryDate: '',
    deliveryOption: '7days'
  })
  const [saving, setSaving] = useState(false)

  const pendingLetters = getFutureLetters()
  const deliveredLetters = getDeliveredLetters()

  const deliveryOptions = {
    '7days': { label: '7 Days', days: 7 },
    '30days': { label: '30 Days', days: 30 },
    '6months': { label: '6 Months', days: 180 },
    '1year': { label: '1 Year', days: 365 },
    'custom': { label: 'Custom Date', days: null }
  }

  const handleDeliveryOptionChange = (option) => {
    setLetterForm({ ...letterForm, deliveryOption: option })
    
    if (option !== 'custom') {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + deliveryOptions[option].days)
      setLetterForm(prev => ({
        ...prev,
        deliveryDate: futureDate.toISOString().split('T')[0]
      }))
    }
  }

  const handleSaveLetter = async () => {
    if (!letterForm.title.trim() || !letterForm.content.trim() || !letterForm.deliveryDate) {
      alert('Please fill in all fields')
      return
    }

    const deliveryDate = new Date(letterForm.deliveryDate)
    const today = new Date()
    
    if (deliveryDate <= today) {
      alert('Delivery date must be in the future')
      return
    }

    try {
      setSaving(true)
      
      addFutureLetter({
        title: letterForm.title.trim(),
        content: letterForm.content.trim(),
        deliveryDate: letterForm.deliveryDate,
        createdAt: new Date().toISOString()
      })

      setLetterForm({
        title: '',
        content: '',
        deliveryDate: '',
        deliveryOption: '7days'
      })

      alert('Letter scheduled for delivery! 📮')
      setActiveTab('pending')
    } catch (error) {
      console.error('Error saving letter:', error)
      alert('Error saving letter. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReadLetter = (letterId) => {
    markLetterAsRead(letterId)
  }

  const formatDeliveryDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Tomorrow'
    } else if (diffDays > 0) {
      return `In ${diffDays} days`
    } else {
      return 'Delivered'
    }
  }

  const renderWriteView = () => (
    <div className="write-letter-view">
      <div className="letter-intro">
        <h3>✉️ Write to Your Future Self</h3>
        <p>Share your thoughts, goals, and feelings with the person you'll become.</p>
      </div>

      <div className="letter-form">
        <div className="form-group">
          <label htmlFor="letterTitle">Letter Title</label>
          <input
            type="text"
            id="letterTitle"
            value={letterForm.title}
            onChange={(e) => setLetterForm({ ...letterForm, title: e.target.value })}
            placeholder="What's this letter about?"
            className="letter-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="letterContent">Your Message</label>
          <textarea
            id="letterContent"
            value={letterForm.content}
            onChange={(e) => setLetterForm({ ...letterForm, content: e.target.value })}
            placeholder="Dear Future Me,

How are you doing? I hope you're well and that you've grown since I wrote this...

Right now, I'm feeling...
My current goals are...
I hope by the time you read this...

Love,
Present You"
            rows="12"
            className="letter-textarea"
          />
        </div>

        <div className="delivery-section">
          <label>When should this be delivered?</label>
          <div className="delivery-options">
            {Object.entries(deliveryOptions).map(([key, option]) => (
              <button
                key={key}
                className={`delivery-option ${letterForm.deliveryOption === key ? 'selected' : ''}`}
                onClick={() => handleDeliveryOptionChange(key)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {letterForm.deliveryOption === 'custom' && (
            <div className="custom-date">
              <input
                type="date"
                value={letterForm.deliveryDate}
                onChange={(e) => setLetterForm({ ...letterForm, deliveryDate: e.target.value })}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className="date-input"
              />
            </div>
          )}

          {letterForm.deliveryDate && (
            <div className="delivery-preview">
              📅 Will be delivered on {new Date(letterForm.deliveryDate).toLocaleDateString('en', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
        </div>

        <button 
          className="send-letter-btn"
          onClick={handleSaveLetter}
          disabled={saving || !letterForm.title.trim() || !letterForm.content.trim() || !letterForm.deliveryDate}
        >
          {saving ? 'Scheduling...' : '📮 Schedule Letter'}
        </button>
      </div>
    </div>
  )

  const renderPendingView = () => (
    <div className="pending-letters-view">
      <h3>⏳ Pending Letters</h3>
      
      {pendingLetters.length === 0 ? (
        <div className="no-letters">
          <div className="no-letters-icon">📭</div>
          <p>No letters scheduled yet.</p>
          <button 
            className="write-first-letter-btn"
            onClick={() => setActiveTab('write')}
          >
            Write Your First Letter
          </button>
        </div>
      ) : (
        <div className="letters-list">
          {pendingLetters.map(letter => (
            <div key={letter.id} className="letter-card pending">
              <div className="letter-header">
                <div className="letter-title">{letter.title}</div>
                <div className="letter-delivery">
                  {formatDeliveryDate(letter.deliveryDate)}
                </div>
              </div>
              <div className="letter-preview">
                {letter.content.substring(0, 100)}...
              </div>
              <div className="letter-meta">
                Written on {new Date(letter.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderDeliveredView = () => (
    <div className="delivered-letters-view">
      <h3>📬 Delivered Letters</h3>
      
      {deliveredLetters.length === 0 ? (
        <div className="no-letters">
          <div className="no-letters-icon">📪</div>
          <p>No letters have been delivered yet.</p>
        </div>
      ) : (
        <div className="letters-list">
          {deliveredLetters.map(letter => (
            <div key={letter.id} className="letter-card delivered">
              <div className="letter-header">
                <div className="letter-title">{letter.title}</div>
                <div className="letter-status">
                  {letter.isRead ? '✅ Read' : '🆕 New'}
                </div>
              </div>
              <div className="letter-content">
                {letter.content}
              </div>
              <div className="letter-meta">
                Written on {new Date(letter.createdAt).toLocaleDateString()} • 
                Delivered on {new Date(letter.deliveryDate).toLocaleDateString()}
              </div>
              {!letter.isRead && (
                <button 
                  className="mark-read-btn"
                  onClick={() => handleReadLetter(letter.id)}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Layout title="✉️ Letter to Future Self" showBackButton={true} backTo="/features">
      <div className="future-letters-content">
        <div className="letters-tabs">
          <button 
            className={`tab-btn ${activeTab === 'write' ? 'active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            ✍️ Write
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Pending ({pendingLetters.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivered')}
          >
            📬 Delivered ({deliveredLetters.length})
          </button>
        </div>

        {activeTab === 'write' && renderWriteView()}
        {activeTab === 'pending' && renderPendingView()}
        {activeTab === 'delivered' && renderDeliveredView()}
      </div>
    </Layout>
  )
}