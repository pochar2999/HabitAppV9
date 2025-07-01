import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { HabitProvider } from './contexts/HabitContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import BuildHabits from './pages/BuildHabits'
import BreakHabits from './pages/BreakHabits'
import Strategy from './pages/Strategy'
import MyHabits from './pages/MyHabits'
import Progress from './pages/Progress'
import Support from './pages/Support'

function App() {
  return (
    <AuthProvider>
      <HabitProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/build-habits" element={
              <ProtectedRoute>
                <BuildHabits />
              </ProtectedRoute>
            } />
            <Route path="/break-habits" element={
              <ProtectedRoute>
                <BreakHabits />
              </ProtectedRoute>
            } />
            <Route path="/strategy/:habitId/:type" element={
              <ProtectedRoute>
                <Strategy />
              </ProtectedRoute>
            } />
            <Route path="/my-habits" element={
              <ProtectedRoute>
                <MyHabits />
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </HabitProvider>
    </AuthProvider>
  )
}

export default App