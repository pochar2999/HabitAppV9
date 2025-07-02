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
  const [habitStacks, setHabitStacks] = useState({})
  const [habitAnalytics, setHabitAnalytics] = useState({})
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
      setHabitStacks({})
      setHabitAnalytics({})
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
        setHabitStacks(userData.habitStacks || {})
        setHabitAnalytics(userData.habitAnalytics || {})
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
        habitStacks,
        habitAnalytics,
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
        bestStreak: 0,
        completionType: habitData.completionType || 'single', // 'single' or 'multi'
        targetCount: habitData.targetCount || 1,
        currentProgress: 0
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
      if (newCompletion[date][habitId]) {
        delete newCompletion[date][habitId]
      }
      if (Object.keys(newCompletion[date]).length === 0) {
        delete newCompletion[date]
      }
    })
    setHabitCompletion(newCompletion)

    // Remove preferences
    const newPreferences = { ...habitPreferences }
    delete newPreferences[habitId]
    setHabitPreferences(newPreferences)

    // Remove analytics
    const newAnalytics = { ...habitAnalytics }
    delete newAnalytics[habitId]
    setHabitAnalytics(newAnalytics)
  }

  function updateHabitProgress(habitId, increment = 1) {
    const today = new Date().toISOString().split('T')[0]
    const habit = habits[habitId]
    
    if (!habit) return

    const newCompletion = { ...habitCompletion }
    if (!newCompletion[today]) {
      newCompletion[today] = {}
    }

    const currentProgress = newCompletion[today][habitId]?.progress || 0
    const newProgress = Math.min(currentProgress + increment, habit.targetCount)
    
    newCompletion[today][habitId] = {
      progress: newProgress,
      completed: newProgress >= habit.targetCount,
      completedAt: newProgress >= habit.targetCount ? new Date().toISOString() : null
    }

    setHabitCompletion(newCompletion)

    // Update habit streak if completed
    if (newProgress >= habit.targetCount && currentProgress < habit.targetCount) {
      const newHabits = { ...habits }
      newHabits[habitId].streak = (newHabits[habitId].streak || 0) + 1
      newHabits[habitId].bestStreak = Math.max(
        newHabits[habitId].bestStreak || 0,
        newHabits[habitId].streak
      )
      newHabits[habitId].lastCompleted = today
      setHabits(newHabits)
      markDayActive()
    }
  }

  function completeHabit(habitId) {
    const habit = habits[habitId]
    if (!habit) return

    if (habit.completionType === 'multi') {
      updateHabitProgress(habitId, 1)
    } else {
      updateHabitProgress(habitId, habit.targetCount)
    }
  }

  function uncompleteHabit(habitId) {
    const today = new Date().toISOString().split('T')[0]
    
    const newCompletion = { ...habitCompletion }
    if (newCompletion[today] && newCompletion[today][habitId]) {
      delete newCompletion[today][habitId]
      if (Object.keys(newCompletion[today]).length === 0) {
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
      const hasCompletedHabits = Object.keys(newCompletion[today] || {}).some(
        hId => newCompletion[today][hId]?.completed
      )
      if (!hasCompletedHabits) {
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
    return habitCompletion[today]?.[habitId]?.completed || false
  }

  function getHabitProgressToday(habitId) {
    const today = new Date().toISOString().split('T')[0]
    const habitData = habitCompletion[today]?.[habitId]
    const habit = habits[habitId]
    
    return {
      current: habitData?.progress || 0,
      target: habit?.targetCount || 1,
      completed: habitData?.completed || false
    }
  }

  function getActiveHabitsCount() {
    return Object.keys(habits).length
  }

  function getCurrentStreak() {
    const dates = Object.keys(activityLog).sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    
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
      
      // Get habits that existed on this specific date
      const habitsOnDate = Object.values(habits).filter(habit => {
        const habitCreatedDate = new Date(habit.createdAt).toISOString().split('T')[0]
        return habitCreatedDate <= dateStr
      })
      
      // Count completed habits on this date
      const completedHabits = habitsOnDate.filter(habit => {
        return habitCompletion[dateStr]?.[habit.id]?.completed
      }).length
      
      const totalHabits = habitsOnDate.length
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

  // Habit Stack functions
  function createHabitStack(stackData) {
    const stackId = Date.now().toString()
    const newStacks = {
      ...habitStacks,
      [stackId]: {
        ...stackData,
        id: stackId,
        createdAt: new Date().toISOString()
      }
    }
    setHabitStacks(newStacks)
    return stackId
  }

  function updateHabitStack(stackId, stackData) {
    const newStacks = {
      ...habitStacks,
      [stackId]: {
        ...habitStacks[stackId],
        ...stackData,
        updatedAt: new Date().toISOString()
      }
    }
    setHabitStacks(newStacks)
  }

  function deleteHabitStack(stackId) {
    const newStacks = { ...habitStacks }
    delete newStacks[stackId]
    setHabitStacks(newStacks)
  }

  function getHabitStacks() {
    return Object.values(habitStacks)
  }

  // Analytics functions
  function logHabitAnalytics(habitId, analyticsData) {
    const today = new Date().toISOString().split('T')[0]
    const newAnalytics = { ...habitAnalytics }
    
    if (!newAnalytics[habitId]) {
      newAnalytics[habitId] = {}
    }
    
    newAnalytics[habitId][today] = {
      ...analyticsData,
      timestamp: new Date().toISOString()
    }
    
    setHabitAnalytics(newAnalytics)
  }

  function getHabitAnalytics(habitId) {
    return habitAnalytics[habitId] || {}
  }

  function getWeeklyAnalyticsSummary(habitId) {
    const analytics = getHabitAnalytics(habitId)
    const last7Days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      if (analytics[dateStr]) {
        last7Days.push(analytics[dateStr])
      }
    }
    
    if (last7Days.length === 0) return null
    
    // Calculate averages and trends
    const avgMoodBefore = last7Days.reduce((sum, day) => sum + (day.moodBefore || 0), 0) / last7Days.length
    const avgMoodAfter = last7Days.reduce((sum, day) => sum + (day.moodAfter || 0), 0) / last7Days.length
    const avgEffort = last7Days.reduce((sum, day) => sum + (day.effort || 0), 0) / last7Days.length
    
    const moodImprovement = avgMoodAfter - avgMoodBefore
    
    return {
      avgMoodBefore: Math.round(avgMoodBefore * 10) / 10,
      avgMoodAfter: Math.round(avgMoodAfter * 10) / 10,
      avgEffort: Math.round(avgEffort * 10) / 10,
      moodImprovement: Math.round(moodImprovement * 10) / 10,
      totalEntries: last7Days.length
    }
  }

  // Auto-save when data changes
  useEffect(() => {
    if (!loading && currentUser) {
      saveUserData()
    }
  }, [habits, habitCompletion, activityLog, habitPreferences, habitStacks, habitAnalytics])

  const value = {
    habits,
    habitCompletion,
    activityLog,
    habitPreferences,
    habitStacks,
    habitAnalytics,
    loading,
    addHabit,
    removeHabit,
    completeHabit,
    uncompleteHabit,
    updateHabitProgress,
    isHabitCompletedToday,
    getHabitProgressToday,
    getActiveHabitsCount,
    getCurrentStreak,
    getWeeklyProgress,
    getHabitPreferences,
    updateHabitPreferences,
    createHabitStack,
    updateHabitStack,
    deleteHabitStack,
    getHabitStacks,
    logHabitAnalytics,
    getHabitAnalytics,
    getWeeklyAnalyticsSummary,
    loadUserData
  }

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  )
}