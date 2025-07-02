import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const HabitContext = createContext()

export function useHabits() {
  return useContext(HabitContext)
}

export function HabitProvider({ children }) {
  const { currentUser, getUserData, updateUserData } = useAuth()
  const [habits, setHabits] = useState({})
  const [habitCompletion, setHabitCompletion] = useState({})
  const [activityLog, setActivityLog] = useState({})
  const [habitPreferences, setHabitPreferences] = useState({})
  const [loading, setLoading] = useState(true)

  // Load user data when user changes
  useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      loadUserData()
    } else {
      setHabits({})
      setHabitCompletion({})
      setActivityLog({})
      setHabitPreferences({})
      setLoading(false)
    }
  }, [currentUser])

  async function loadUserData() {
    try {
      setLoading(true)
      const userData = await getUserData(currentUser.uid)
      if (userData) {
        setHabits(userData.habits || {})
        setHabitCompletion(userData.habitCompletion || {})
        setActivityLog(userData.activityLog || {})
        setHabitPreferences(userData.habitPreferences || {})
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveUserData() {
    if (!currentUser) return

    try {
      await updateUserData(currentUser.uid, {
        habits,
        habitCompletion,
        activityLog,
        habitPreferences,
        lastUpdated: new Date()
      })
    } catch (error) {
      console.error('Error saving user data:', error)
    }
  }

  function addHabit(habitId, habitData) {
    const newHabits = {
      ...habits,
      [habitId]: {
        ...habitData,
        id: habitId,
        createdAt: new Date().toISOString(),
        streak: 0,
        bestStreak: 0
      }
    }
    setHabits(newHabits)
    
    // Mark today as active since user added a habit
    markDayActive()
  }

  function removeHabit(habitId) {
    const newHabits = { ...habits }
    delete newHabits[habitId]
    setHabits(newHabits)

    // Remove from completion data
    const newCompletion = { ...habitCompletion }
    Object.keys(newCompletion).forEach(date => {
      newCompletion[date] = newCompletion[date].filter(id => id !== habitId)
      if (newCompletion[date].length === 0) {
        delete newCompletion[date]
      }
    })
    setHabitCompletion(newCompletion)

    // Remove preferences
    const newPreferences = { ...habitPreferences }
    delete newPreferences[habitId]
    setHabitPreferences(newPreferences)
  }

  function completeHabit(habitId) {
    const today = new Date().toISOString().split('T')[0]
    
    // Add to completion log
    const newCompletion = { ...habitCompletion }
    if (!newCompletion[today]) {
      newCompletion[today] = []
    }
    if (!newCompletion[today].includes(habitId)) {
      newCompletion[today].push(habitId)
      setHabitCompletion(newCompletion)

      // Update habit streak
      const newHabits = { ...habits }
      if (newHabits[habitId]) {
        newHabits[habitId].streak = (newHabits[habitId].streak || 0) + 1
        newHabits[habitId].bestStreak = Math.max(
          newHabits[habitId].bestStreak || 0,
          newHabits[habitId].streak
        )
        newHabits[habitId].lastCompleted = today
        setHabits(newHabits)
      }

      // Mark day as active
      markDayActive()
    }
  }

  function uncompleteHabit(habitId) {
    const today = new Date().toISOString().split('T')[0]
    
    // Remove from completion log
    const newCompletion = { ...habitCompletion }
    if (newCompletion[today]) {
      newCompletion[today] = newCompletion[today].filter(id => id !== habitId)
      if (newCompletion[today].length === 0) {
        delete newCompletion[today]
      }
      setHabitCompletion(newCompletion)

      // Update habit streak
      const newHabits = { ...habits }
      if (newHabits[habitId]) {
        newHabits[habitId].streak = Math.max(0, (newHabits[habitId].streak || 0) - 1)
        setHabits(newHabits)
      }

      // Check if day should still be active
      if (!newCompletion[today] || newCompletion[today].length === 0) {
        const newActivityLog = { ...activityLog }
        delete newActivityLog[today]
        setActivityLog(newActivityLog)
      }
    }
  }

  function markDayActive() {
    const today = new Date().toISOString().split('T')[0]
    const newActivityLog = { ...activityLog }
    newActivityLog[today] = true
    setActivityLog(newActivityLog)
  }

  function isHabitCompletedToday(habitId) {
    const today = new Date().toISOString().split('T')[0]
    return habitCompletion[today]?.includes(habitId) || false
  }

  function getActiveHabitsCount() {
    return Object.keys(habits).length
  }

  function getCurrentStreak() {
    const dates = Object.keys(activityLog).sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    
    // Start from today and count backwards
    let currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      if (activityLog[dateStr]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  function getWeeklyProgress() {
    const weekData = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const completedHabits = habitCompletion[dateStr]?.length || 0
      const totalHabits = Object.keys(habits).length
      const percentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0
      
      weekData.push({
        date: dateStr,
        day: date.toLocaleDateString('en', { weekday: 'short' }).charAt(0),
        percentage,
        completedHabits,
        totalHabits
      })
    }
    
    return weekData
  }

  function getHabitPreferences(habitId) {
    return habitPreferences[habitId] || {}
  }

  function updateHabitPreferences(habitId, preferences) {
    const newPreferences = {
      ...habitPreferences,
      [habitId]: {
        ...preferences,
        lastUpdated: new Date().toISOString()
      }
    }
    setHabitPreferences(newPreferences)
  }

  // Auto-save when data changes
  useEffect(() => {
    if (!loading && currentUser) {
      saveUserData()
    }
  }, [habits, habitCompletion, activityLog, habitPreferences])

  const value = {
    habits,
    habitCompletion,
    activityLog,
    habitPreferences,
    loading,
    addHabit,
    removeHabit,
    completeHabit,
    uncompleteHabit,
    isHabitCompletedToday,
    getActiveHabitsCount,
    getCurrentStreak,
    getWeeklyProgress,
    getHabitPreferences,
    updateHabitPreferences,
    loadUserData
  }

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  )
}