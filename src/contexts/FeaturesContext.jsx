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
  const [mealLogs, setMealLogs] = useState({})
  const [waterIntake, setWaterIntake] = useState({})
  const [mealTrackerSettings, setMealTrackerSettings] = useState({ waterGoal: 8 })
  const [futureLetters, setFutureLetters] = useState([])
  const [gratitudeEntries, setGratitudeEntries] = useState([])
  const [dayReflections, setDayReflections] = useState([])
  const [bucketListItems, setBucketListItems] = useState([])
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
    setMealLogs({})
    setWaterIntake({})
    setMealTrackerSettings({ waterGoal: 8 })
    setFutureLetters([])
    setGratitudeEntries([])
    setDayReflections([])
    setBucketListItems([])
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
        setMealLogs(userData.mealLogs || {})
        setWaterIntake(userData.waterIntake || {})
        setMealTrackerSettings(userData.mealTrackerSettings || { waterGoal: 8 })
        setFutureLetters(userData.futureLetters || [])
        setGratitudeEntries(userData.gratitudeEntries || [])
        setDayReflections(userData.dayReflections || [])
        setBucketListItems(userData.bucketListItems || [])
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
        mealLogs,
        waterIntake,
        mealTrackerSettings,
        futureLetters,
        gratitudeEntries,
        dayReflections,
        bucketListItems,
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

  // Meal Tracker functions
  function getMealLogs(date) {
    return mealLogs[date] || []
  }

  function addMealLog(date, mealData) {
    const meal = {
      id: Date.now().toString(),
      ...mealData
    }
    
    setMealLogs(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), meal]
    }))
    
    return meal.id
  }

  function getWaterIntake(date) {
    return waterIntake[date] || 0
  }

  function updateWaterIntake(date, amount) {
    setWaterIntake(prev => ({
      ...prev,
      [date]: Math.max(0, amount)
    }))
  }

  function getMealTrackerSettings() {
    return mealTrackerSettings
  }

  function updateMealTrackerSettings(settings) {
    setMealTrackerSettings(prev => ({ ...prev, ...settings }))
  }

  function getMealStreak() {
    const dates = Object.keys(mealLogs).sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    
    let currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const meals = mealLogs[dateStr] || []
      
      if (meals.length >= 3) { // At least 3 meals per day
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  function getWaterStreak() {
    const dates = Object.keys(waterIntake).sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    const waterGoal = mealTrackerSettings.waterGoal || 8
    
    let currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const water = waterIntake[dateStr] || 0
      
      if (water >= waterGoal) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  // Future Letters functions
  function getFutureLetters() {
    const now = new Date()
    return futureLetters.filter(letter => {
      const deliveryDate = new Date(letter.deliveryDate)
      return deliveryDate > now && !letter.delivered
    }).sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
  }

  function getDeliveredLetters() {
    const now = new Date()
    return futureLetters.filter(letter => {
      const deliveryDate = new Date(letter.deliveryDate)
      return deliveryDate <= now || letter.delivered
    }).sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate))
  }

  function addFutureLetter(letterData) {
    const letter = {
      id: Date.now().toString(),
      ...letterData,
      delivered: false,
      isRead: false
    }
    
    setFutureLetters(prev => [...prev, letter])
    return letter.id
  }

  function markLetterAsRead(letterId) {
    setFutureLetters(prev => prev.map(letter =>
      letter.id === letterId ? { ...letter, isRead: true } : letter
    ))
  }

  // Gratitude functions
  function getGratitudeEntries() {
    return gratitudeEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  function addGratitudeEntry(text) {
    const entry = {
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    }
    
    setGratitudeEntries(prev => [entry, ...prev])
    return entry.id
  }

  function deleteGratitudeEntry(entryId) {
    setGratitudeEntries(prev => prev.filter(entry => entry.id !== entryId))
  }

  function getGratitudeStreak() {
    const dates = {}
    gratitudeEntries.forEach(entry => {
      const date = new Date(entry.timestamp).toDateString()
      dates[date] = true
    })
    
    let streak = 0
    let currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toDateString()
      if (dates[dateStr]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  // Day Reflection functions
  function getDayReflections() {
    return dayReflections.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  function addDayReflection(reflectionData) {
    const reflection = {
      id: Date.now().toString(),
      ...reflectionData,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    }
    
    setDayReflections(prev => [reflection, ...prev])
    return reflection.id
  }

  function deleteDayReflection(reflectionId) {
    setDayReflections(prev => prev.filter(reflection => reflection.id !== reflectionId))
  }

  function getDayReflectionStreak() {
    const dates = {}
    dayReflections.forEach(reflection => {
      const date = new Date(reflection.timestamp).toDateString()
      dates[date] = true
    })
    
    let streak = 0
    let currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toDateString()
      if (dates[dateStr]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  // Bucket List functions
  function getBucketListItems() {
    return bucketListItems.sort((a, b) => {
      // Sort completed items to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }

  function addBucketListItem(itemData) {
    const item = {
      id: Date.now().toString(),
      ...itemData,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    }
    
    setBucketListItems(prev => [...prev, item])
    return item.id
  }

  function updateBucketListItem(itemId, updates) {
    setBucketListItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ))
  }

  function completeBucketListItem(itemId) {
    setBucketListItems(prev => prev.map(item =>
      item.id === itemId 
        ? { ...item, completed: true, completedAt: new Date().toISOString() }
        : item
    ))
  }

  function deleteBucketListItem(itemId) {
    setBucketListItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Auto-save when data changes with debouncing
  useEffect(() => {
    if (!loading && currentUser) {
      const timeoutId = setTimeout(() => {
        saveFeaturesData()
      }, 500) // Debounce saves by 500ms

      return () => clearTimeout(timeoutId)
    }
  }, [
    journalEntries, calendarEvents, todoItems, mealLogs, waterIntake, 
    mealTrackerSettings, futureLetters, gratitudeEntries, dayReflections, 
    bucketListItems
  ])

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
    
    // Meal Tracker
    getMealLogs,
    addMealLog,
    getWaterIntake,
    updateWaterIntake,
    getMealTrackerSettings,
    updateMealTrackerSettings,
    getMealStreak,
    getWaterStreak,
    
    // Future Letters
    getFutureLetters,
    getDeliveredLetters,
    addFutureLetter,
    markLetterAsRead,
    
    // Gratitude
    getGratitudeEntries,
    addGratitudeEntry,
    deleteGratitudeEntry,
    getGratitudeStreak,
    
    // Day Reflections
    getDayReflections,
    addDayReflection,
    deleteDayReflection,
    getDayReflectionStreak,
    
    // Bucket List
    getBucketListItems,
    addBucketListItem,
    updateBucketListItem,
    completeBucketListItem,
    deleteBucketListItem,
    
    // General
    loading
  }

  return (
    <FeaturesContext.Provider value={value}>
      {children}
    </FeaturesContext.Provider>
  )
}