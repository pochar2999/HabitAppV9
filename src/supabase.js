import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up Supabase connection.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const auth = {
  // Sign up with email and password
  async signUp(email, password, name, shareProgress = false) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          share_progress: shareProgress
        }
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Reset password
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Profile functions
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Habit functions
  async getUserHabits(userId) {
    const { data, error } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createHabit(userId, habitId, habitType) {
    const { data, error } = await supabase
      .from('user_habits')
      .insert({
        user_id: userId,
        habit_id: habitId,
        habit_type: habitType
      })
      .select()
      .single()
    return { data, error }
  },

  async updateHabit(habitId, updates) {
    const { data, error } = await supabase
      .from('user_habits')
      .update(updates)
      .eq('id', habitId)
      .select()
      .single()
    return { data, error }
  },

  // Completion functions
  async getHabitCompletions(userHabitId) {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_habit_id', userHabitId)
      .order('completion_date', { ascending: false })
    return { data, error }
  },

  async markHabitComplete(userHabitId, date = new Date().toISOString().split('T')[0], notes = null) {
    const { data, error } = await supabase
      .from('habit_completions')
      .insert({
        user_habit_id: userHabitId,
        completion_date: date,
        notes
      })
      .select()
      .single()
    return { data, error }
  },

  async removeHabitCompletion(userHabitId, date) {
    const { error } = await supabase
      .from('habit_completions')
      .delete()
      .eq('user_habit_id', userHabitId)
      .eq('completion_date', date)
    return { error }
  }
}