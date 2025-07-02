import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, name) {
    const userCred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCred.user, { displayName: name })
    await sendEmailVerification(userCred.user)

    // Create user document in Firestore
    await setDoc(doc(db, "users", userCred.user.uid), {
      userId: userCred.user.uid,
      name,
      email,
      verified: false,
      createdAt: new Date(),
      lastLogin: new Date(),
      habits: {},
      habitCompletion: {},
      activityLog: {},
      habitPreferences: {}
    })

    return userCred
  }

  async function login(email, password) {
    const userCred = await signInWithEmailAndPassword(auth, email, password)
    
    // Update last login time
    await updateDoc(doc(db, "users", userCred.user.uid), {
      lastLogin: new Date()
    })

    return userCred
  }

  async function logout() {
    return signOut(auth)
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  async function getUserData(uid) {
    const userDoc = await getDoc(doc(db, "users", uid))
    return userDoc.exists() ? userDoc.data() : null
  }

  async function updateUserData(uid, data) {
    return updateDoc(doc(db, "users", uid), data)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    getUserData,
    updateUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}