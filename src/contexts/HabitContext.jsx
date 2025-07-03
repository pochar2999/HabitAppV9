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
  const [dailyStats, setDailyStats] = useState({})
  const [loading, setLoading] = useState(true)

  // Load user data when user changes
  useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      loadUserData()
    } else {
      resetAllData()
    }
  }, [currentUser])

  function resetAllData() {
    setHabits({})
    setHabitCompletion({})
    setActivityLog({})
    setHabitPreferences({})
    setHabitStacks({})
    setHabitAnalytics({})
    setDailyStats({})
    setLoading(false)
  }

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
        setDailyStats(userData.dailyStats || {})
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
        dailyStats,
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
        completionType: habitData.completionType || 'single',
        targetCount: habitData.targetCount || 1,
        currentProgress: 0
      }
    }
    setHabits(newHabits)
    
    // Save preferences if provided
    if (habitData.preferences && Object.keys(habitData.preferences).length > 0) {
      const newPreferences = {
        ...habitPreferences,
        [habitId]: {
          ...habitData.preferences,
          lastUpdated: new Date().toISOString()
        }
      }
      setHabitPreferences(newPreferences)
    }
    
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

    // Update daily stats
    updateDailyStatsForDate(new Date().toISOString().split('T')[0])
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
      completedAt: newProgress >= habit.targetCount ? new Date().toISOString() : (newCompletion[today][habitId]?.completedAt || null)
    }

    setHabitCompletion(newCompletion)

    // Update habit streak if completed for the first time today
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

    // Update daily stats
    updateDailyStatsForDate(today)
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

      // Update daily stats
      updateDailyStatsForDate(today)
    }
  }

  function markDayActive() {
    const today = new Date().toISOString().split('T')[0]
    const newActivityLog = { ...activityLog }
    newActivityLog[today] = true
    setActivityLog(newActivityLog)
  }

  function updateDailyStatsForDate(dateStr) {
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
    
    const newDailyStats = { ...dailyStats }
    if (totalHabits > 0) {
      newDailyStats[dateStr] = {
        habitsCompleted: completedHabits,
        habitsTotal: totalHabits,
        percentage: Math.round((completedHabits / totalHabits) * 100)
      }
    } else {
      delete newDailyStats[dateStr]
    }
    
    setDailyStats(newDailyStats)
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
      
      // Use stored daily stats if available, otherwise calculate
      let percentage = 0
      let completedHabits = 0
      let totalHabits = 0
      
      if (dailyStats[dateStr]) {
        percentage = dailyStats[dateStr].percentage
        completedHabits = dailyStats[dateStr].habitsCompleted
        totalHabits = dailyStats[dateStr].habitsTotal
      } else {
        // Calculate for this date
        const habitsOnDate = Object.values(habits).filter(habit => {
          const habitCreatedDate = new Date(habit.createdAt).toISOString().split('T')[0]
          return habitCreatedDate <= dateStr
        })
        
        completedHabits = habitsOnDate.filter(habit => {
          return habitCompletion[dateStr]?.[habit.id]?.completed
        }).length
        
        totalHabits = habitsOnDate.length
        percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
      }
      
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

    // Update habit target count if it changed
    const habit = habits[habitId]
    if (habit) {
      const { getHabitTargetCount } = require('../data/habitPreferences')
      const newTargetCount = getHabitTargetCount(habitId, preferences)
      
      if (newTargetCount !== habit.targetCount) {
        const newHabits = {
          ...habits,
          [habitId]: {
            ...habit,
            targetCount: newTargetCount
          }
        }
        setHabits(newHabits)
      }
    }
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

  // Auto-save when data changes with debouncing
  useEffect(() => {
    if (!loading && currentUser) {
      const timeoutId = setTimeout(() => {
        saveUserData()
      }, 500) // Debounce saves by 500ms

      return () => clearTimeout(timeoutId)
    }
  }, [habits, habitCompletion, activityLog, habitPreferences, habitStacks, habitAnalytics, dailyStats])

  // Update daily stats when habits or completion data changes
  useEffect(() => {
    if (!loading && currentUser) {
      const today = new Date().toISOString().split('T')[0]
      updateDailyStatsForDate(today)
    }
  }, [habits, habitCompletion])

  const value = {
    habits,
    habitCompletion,
    activityLog,
    habitPreferences,
    habitStacks,
    habitAnalytics,
    dailyStats,
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