import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function CalendarApp() {
  const { getCalendarEvents, addCalendarEvent, deleteCalendarEvent, getEventsForMonth } = useFeatures()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // 'day', 'week', 'month'
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    category: 'general',
    description: ''
  })

  const categories = {
    birthday: { label: 'Birthday', color: '#f093fb', emoji: '🎂' },
    work: { label: 'Work', color: '#667eea', emoji: '💼' },
    school: { label: 'School', color: '#4facfe', emoji: '📚' },
    personal: { label: 'Personal', color: '#48bb78', emoji: '🏠' },
    health: { label: 'Health', color: '#ed8936', emoji: '🏥' },
    todo: { label: 'Todo', color: '#a0aec0', emoji: '📋' },
    general: { label: 'General', color: '#718096', emoji: '📅' }
  }

  const handleAddEvent = (date = null) => {
    setSelectedDate(date)
    setEventForm({
      title: '',
      date: date || new Date().toISOString().split('T')[0],
      category: 'general',
      description: ''
    })
    setShowAddModal(true)
  }

  const handleSaveEvent = () => {
    if (!eventForm.title.trim() || !eventForm.date) {
      alert('Please enter title and date')
      return
    }

    addCalendarEvent(
      eventForm.title,
      eventForm.date,
      eventForm.category,
      eventForm.description
    )

    setShowAddModal(false)
    setEventForm({ title: '', date: '', category: 'general', description: '' })
  }

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteCalendarEvent(eventId)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return getCalendarEvents(dateStr)
  }

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate)
    const monthEvents = getEventsForMonth(currentDate.getFullYear(), currentDate.getMonth())

    return (
      <div className="calendar-month-view">
        <div className="calendar-header">
          <button onClick={() => navigateMonth(-1)}>‹</button>
          <h3>
            {currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => navigateMonth(1)}>›</button>
        </div>
        
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {days.map((date, index) => {
            const events = date ? getEventsForDate(date) : []
            return (
              <div
                key={index}
                className={`calendar-day ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''}`}
                onClick={() => date && handleAddEvent(date.toISOString().split('T')[0])}
              >
                {date && (
                  <>
                    <div className="day-number">{date.getDate()}</div>
                    <div className="day-events">
                      {events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="day-event"
                          style={{ backgroundColor: categories[event.category]?.color }}
                          title={event.title}
                        >
                          {categories[event.category]?.emoji} {event.title}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="more-events">+{events.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const events = getEventsForDate(currentDate)
    
    return (
      <div className="calendar-day-view">
        <div className="day-header">
          <button onClick={() => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}>‹</button>
          <h3>{formatDateForDisplay(currentDate)}</h3>
          <button onClick={() => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}>›</button>
        </div>
        
        <button 
          className="add-event-btn"
          onClick={() => handleAddEvent(currentDate.toISOString().split('T')[0])}
        >
          + Add Event
        </button>
        
        <div className="day-events-list">
          {events.length === 0 ? (
            <div className="no-events">
              <p>No events for this day</p>
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <div className="event-category" style={{ color: categories[event.category]?.color }}>
                    {categories[event.category]?.emoji} {categories[event.category]?.label}
                  </div>
                  <button 
                    className="delete-event-btn"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    ×
                  </button>
                </div>
                <div className="event-title">{event.title}</div>
                {event.description && (
                  <div className="event-description">{event.description}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <Layout title="📆 Calendar" showBackButton={true} backTo="/features">
      <div className="calendar-app-content">
        <div className="calendar-controls">
          <div className="view-switcher">
            <button 
              className={`view-btn ${view === 'day' ? 'active' : ''}`}
              onClick={() => setView('day')}
            >
              Day
            </button>
            <button 
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              Month
            </button>
          </div>
          
          <button className="today-btn" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
        </div>

        {view === 'month' ? renderMonthView() : renderDayView()}

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Event</h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="event-form">
                  <div className="form-group">
                    <label htmlFor="eventTitle">Title</label>
                    <input
                      type="text"
                      id="eventTitle"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Event title"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="eventDate">Date</label>
                    <input
                      type="date"
                      id="eventDate"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="eventCategory">Category</label>
                    <select
                      id="eventCategory"
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    >
                      {Object.entries(categories).map(([key, cat]) => (
                        <option key={key} value={key}>
                          {cat.emoji} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="eventDescription">Description (Optional)</label>
                    <textarea
                      id="eventDescription"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Additional details..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveEvent}
                  disabled={!eventForm.title.trim() || !eventForm.date}
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}