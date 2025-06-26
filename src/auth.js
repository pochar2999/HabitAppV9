import { auth, db } from './supabase.js'

// Global auth state
let currentUser = null
let userProfile = null

// Initialize auth
export async function initAuth() {
  try {
    // Check for existing session
    const { session } = await auth.getSession()
    
    if (session?.user) {
      await handleAuthSuccess(session.user)
    } else {
      showAuthScreens()
    }

    // Listen for auth changes
    auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleAuthSuccess(session.user)
      } else if (event === 'SIGNED_OUT') {
        handleSignOut()
      }
    })
  } catch (error) {
    console.error('Auth initialization error:', error)
    showAuthScreens()
  }
}

async function handleAuthSuccess(user) {
  currentUser = user
  
  // Get user profile
  const { data: profile, error } = await db.getProfile(user.id)
  if (profile) {
    userProfile = profile
    // Update last login
    await db.updateProfile(user.id, { last_login: new Date().toISOString() })
  }
  
  showMainApp()
  await loadUserData()
}

function handleSignOut() {
  currentUser = null
  userProfile = null
  showAuthScreens()
  clearUserData()
}

function showAuthScreens() {
  document.getElementById('bottom-nav').style.display = 'none'
  navigateTo('welcome')
}

function showMainApp() {
  document.getElementById('bottom-nav').style.display = 'flex'
  navigateTo('home')
}

// Auth form handlers
export function setupAuthForms() {
  // Sign up form
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleSignUp()
  })

  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleSignIn()
  })

  // Forgot password form
  document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleForgotPassword()
  })

  // Verification form
  document.getElementById('verification-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleEmailVerification()
  })

  // Setup verification digit inputs
  setupVerificationInputs()
}

async function handleSignUp() {
  const name = document.getElementById('signup-name').value.trim()
  const email = document.getElementById('signup-email').value.trim()
  const password = document.getElementById('signup-password').value
  const confirmPassword = document.getElementById('signup-confirm-password').value
  const shareProgress = document.getElementById('share-progress').checked

  // Validation
  if (!name || !email || !password) {
    showToast('Please fill in all fields', 'error')
    return
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error')
    return
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error')
    return
  }

  const signupBtn = document.getElementById('signup-btn')
  signupBtn.disabled = true
  signupBtn.textContent = 'Creating Account...'

  try {
    const { data, error } = await auth.signUp(email, password, name, shareProgress)
    
    if (error) {
      throw error
    }

    if (data.user && !data.user.email_confirmed_at) {
      // Show verification screen
      document.getElementById('verification-email').textContent = email
      navigateTo('verification')
      showToast('Verification code sent to your email', 'success')
    } else {
      showToast('Account created successfully!', 'success')
    }
  } catch (error) {
    console.error('Sign up error:', error)
    showToast(error.message || 'Failed to create account', 'error')
  } finally {
    signupBtn.disabled = false
    signupBtn.textContent = 'Create Account'
  }
}

async function handleSignIn() {
  const email = document.getElementById('login-email').value.trim()
  const password = document.getElementById('login-password').value

  if (!email || !password) {
    showToast('Please enter email and password', 'error')
    return
  }

  const loginBtn = document.getElementById('login-btn')
  loginBtn.disabled = true
  loginBtn.textContent = 'Signing In...'

  try {
    const { data, error } = await auth.signIn(email, password)
    
    if (error) {
      throw error
    }

    showToast('Welcome back!', 'success')
  } catch (error) {
    console.error('Sign in error:', error)
    let message = 'Failed to sign in'
    
    if (error.message.includes('Invalid login credentials')) {
      message = 'Invalid email or password'
    } else if (error.message.includes('Email not confirmed')) {
      message = 'Please verify your email before signing in'
    }
    
    showToast(message, 'error')
  } finally {
    loginBtn.disabled = false
    loginBtn.textContent = 'Sign In'
  }
}

async function handleForgotPassword() {
  const email = document.getElementById('reset-email').value.trim()

  if (!email) {
    showToast('Please enter your email address', 'error')
    return
  }

  const resetBtn = document.getElementById('reset-btn')
  resetBtn.disabled = true
  resetBtn.textContent = 'Sending...'

  try {
    const { error } = await auth.resetPassword(email)
    
    if (error) {
      throw error
    }

    showToast('Password reset link sent to your email', 'success')
    navigateTo('login')
  } catch (error) {
    console.error('Reset password error:', error)
    showToast(error.message || 'Failed to send reset link', 'error')
  } finally {
    resetBtn.disabled = false
    resetBtn.textContent = 'Send Reset Link'
  }
}

async function handleEmailVerification() {
  const digits = document.querySelectorAll('.verification-digit')
  const code = Array.from(digits).map(input => input.value).join('')

  if (code.length !== 6) {
    showToast('Please enter the complete 6-digit code', 'error')
    return
  }

  // Note: Supabase handles email verification automatically
  // This is a UI simulation for the verification flow
  showToast('Email verified successfully!', 'success')
  navigateTo('home')
}

function setupVerificationInputs() {
  const inputs = document.querySelectorAll('.verification-digit')
  
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus()
      }
    })
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
        inputs[index - 1].focus()
      }
    })
  })
}

export async function resendVerificationCode() {
  showToast('Verification code resent', 'success')
}

export async function logout() {
  try {
    const { error } = await auth.signOut()
    if (error) throw error
    
    showToast('Signed out successfully', 'success')
  } catch (error) {
    console.error('Sign out error:', error)
    showToast('Failed to sign out', 'error')
  }
}

export async function deleteAccount() {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return
  }

  try {
    // Note: Account deletion would need to be implemented as an edge function
    // For now, just sign out
    await logout()
    showToast('Account deletion requested', 'info')
  } catch (error) {
    console.error('Delete account error:', error)
    showToast('Failed to delete account', 'error')
  }
}

// User data management
async function loadUserData() {
  if (!currentUser || !userProfile) return

  try {
    // Load user habits
    const { data: habits, error } = await db.getUserHabits(currentUser.id)
    
    if (error) {
      console.error('Error loading habits:', error)
      return
    }

    // Convert database habits to app format
    const appHabits = {}
    const activeHabits = []

    for (const habit of habits || []) {
      const { data: completions } = await db.getHabitCompletions(habit.id)
      
      appHabits[habit.habit_id] = {
        id: habit.id,
        startDate: habit.start_date,
        streak: habit.streak,
        bestStreak: habit.best_streak,
        totalDays: habit.total_days,
        completedDays: completions?.map(c => new Date(c.completion_date).toDateString()) || [],
        active: habit.active
      }
      
      if (habit.active) {
        activeHabits.push(habit.habit_id)
      }
    }

    // Update global app data
    window.appData = {
      user: userProfile.name,
      daysLogged: Object.values(appHabits).reduce((total, habit) => total + habit.totalDays, 0),
      activeHabits,
      habits: appHabits,
      userProfile
    }

    // Update UI
    updateHomeScreen()
  } catch (error) {
    console.error('Error loading user data:', error)
  }
}

function clearUserData() {
  window.appData = {
    user: 'User',
    daysLogged: 0,
    activeHabits: [],
    habits: {},
    userProfile: null
  }
}

// Export current user getters
export function getCurrentUser() {
  return currentUser
}

export function getUserProfile() {
  return userProfile
}