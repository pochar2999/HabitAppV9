import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const FeaturesContext = createContext()

export function useFeatures() {
  return useContext(FeaturesContext)
}

export function FeaturesProvider({ children }) {
  const { currentUser, getUserData, updateUserData } = useAuth()
  const [journalEntries, setJournalEntries] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [todoItems, setTodoItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Load user data when user changes
  useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      loadFeaturesData()
    } else {
      resetAllData()
    }
  }, [currentUser])

  function resetAllData() {
    setJournalEntries([])
    setCalendarEvents([])
    setTodoItems([])
    setLoading(false)
  }

  async function loadFeaturesData() {
    try {
      setLoading(true)
      const userData = await getUserData(currentUser.uid)
      if (userData) {
        setJournalEntries(userData.journalEntries || [])
        setCalendarEvents(userData.calendarEvents || [])
        setTodoItems(userData.todoItems || [])
      }
    } catch (error) {
      console.error('Error loading features data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveFeaturesData() {
    if (!currentUser) return

    try {
      await updateUserData(currentUser.uid, {
        journalEntries,
        calendarEvents,
        todoItems,
        lastUpdated: new Date()
      })
    } catch (error) {
      console.error('Error saving features data:', error)
    }
  }

  // Journal functions
  function addJournalEntry(title, content, mood = null) {
    const entry = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      mood,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    }
    setJournalEntries(prev => [entry, ...prev])
    return entry.id
  }

  function deleteJournalEntry(entryId) {
    setJournalEntries(prev => prev.filter(entry => entry.id !== entryId))
  }

  function getJournalEntries() {
    return journalEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  // Calendar functions
  function addCalendarEvent(title, date, category = 'general', description = '') {
    const event = {
      id: Date.now().toString(),
      title: title.trim(),
      date: date,
      category,
      description: description.trim(),
      timestamp: new Date().toISOString()
    }
    setCalendarEvents(prev => [...prev, event])
    return event.id
  }

  function deleteCalendarEvent(eventId) {
    setCalendarEvents(prev => prev.filter(event => event.id !== eventId))
  }

  function getCalendarEvents(date = null) {
    if (date) {
      return calendarEvents.filter(event => event.date === date)
    }
    return calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  function getEventsForMonth(year, month) {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    })
  }

  // Todo functions
  function addTodoItem(title, dueDate = null) {
    const todo = {
      id: Date.now().toString(),
      title: title.trim(),
      dueDate,
      completed: false,
      completedAt: null,
      timestamp: new Date().toISOString()
    }
    
    setTodoItems(prev => [...prev, todo])
    
    // If there's a due date, add it to calendar
    if (dueDate) {
      addCalendarEvent(`📋 ${title}`, dueDate, 'todo', 'Todo item due date')
    }
    
    return todo.id
  }

  function completeTodoItem(todoId) {
    setTodoItems(prev => prev.map(todo => 
      todo.id === todoId 
        ? { ...todo, completed: true, completedAt: new Date().toISOString() }
        : todo
    ))
    
    // Schedule removal after 24 hours
    setTimeout(() => {
      setTodoItems(prev => prev.filter(todo => todo.id !== todoId))
    }, 24 * 60 * 60 * 1000) // 24 hours
  }

  function deleteTodoItem(todoId) {
    const todo = todoItems.find(item => item.id === todoId)
    setTodoItems(prev => prev.filter(item => item.id !== todoId))
    
    // Remove from calendar if it was added there
    if (todo && todo.dueDate) {
      const calendarEvent = calendarEvents.find(event => 
        event.title === `📋 ${todo.title}` && 
        event.date === todo.dueDate &&
        event.category === 'todo'
      )
      if (calendarEvent) {
        deleteCalendarEvent(calendarEvent.id)
      }
    }
  }

  function getActiveTodoItems() {
    return todoItems.filter(todo => !todo.completed)
      .sort((a, b) => {
        // Sort by due date, then by creation time
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate)
        }
        if (a.dueDate && !b.dueDate) return -1
        if (!a.dueDate && b.dueDate) return 1
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
  }

  function getCompletedTodoItems() {
    return todoItems.filter(todo => todo.completed)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  }

  // Auto-save when data changes with debouncing
  useEffect(() => {
    if (!loading && currentUser) {
      const timeoutId = setTimeout(() => {
        saveFeaturesData()
      }, 500) // Debounce saves by 500ms

      return () => clearTimeout(timeoutId)
    }
  }, [journalEntries, calendarEvents, todoItems])

  const value = {
    // Journal
    journalEntries,
    addJournalEntry,
    deleteJournalEntry,
    getJournalEntries,
    
    // Calendar
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    getCalendarEvents,
    getEventsForMonth,
    
    // Todo
    todoItems,
    addTodoItem,
    completeTodoItem,
    deleteTodoItem,
    getActiveTodoItems,
    getCompletedTodoItems,
    
    // General
    loading
  }

  return (
    <FeaturesContext.Provider value={value}>
      {children}
    </FeaturesContext.Provider>
  )
}