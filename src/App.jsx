import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { HabitProvider } from './contexts/HabitContext'
import { CommunityProvider } from './contexts/CommunityContext'
import { FeaturesProvider } from './contexts/FeaturesContext'
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
import Journal from './pages/Journal'
import MyCommunity from './pages/MyCommunity'
import ServerView from './pages/ServerView'
import Progress from './pages/Progress'
import Support from './pages/Support'
import Features from './pages/Features'
import JournalingApp from './pages/features/JournalingApp'
import CalendarApp from './pages/features/CalendarApp'
import TodoApp from './pages/features/TodoApp'
import MealTrackerApp from './pages/features/MealTrackerApp'
import LifeStatsApp from './pages/features/LifeStatsApp'
import FutureLettersApp from './pages/features/FutureLettersApp'
import GratitudeApp from './pages/features/GratitudeApp'
import ReflectionApp from './pages/features/ReflectionApp'
import BucketListApp from './pages/features/BucketListApp'

function App() {
  return (
    <AuthProvider>
      <HabitProvider>
        <CommunityProvider>
          <FeaturesProvider>
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
                <Route path="/journal" element={
                  <ProtectedRoute>
                    <Journal />
                  </ProtectedRoute>
                } />
                <Route path="/features" element={
                  <ProtectedRoute>
                    <Features />
                  </ProtectedRoute>
                } />
                <Route path="/features/journaling" element={
                  <ProtectedRoute>
                    <JournalingApp />
                  </ProtectedRoute>
                } />
                <Route path="/features/calendar" element={
                  <ProtectedRoute>
                    <CalendarApp />
                  </ProtectedRoute>
                } />
                <Route path="/features/todo" element={
                  <ProtectedRoute>
                    <TodoApp />
                  </ProtectedRoute>
                } />
                <Route path="/features/meal-tracker" element={
                  <ProtectedRoute>
                    <MealTrackerApp />
                  </ProtectedRoute>
                } />
                <Route path="/features/life-stats" element={
                  <ProtectedRoute>
                    <LifeStatsApp />
                  </ProtectedRoute>
                } />
                <Route path="/features/future-letters" element={
                  <ProtectedRoute>
                    <FutureLettersApp />
                  </ProtectedRoute>
                } />
                <Route path="/features/gratitude" element={
                  <ProtectedRoute>
                    <GratitudeApp />
                  </ProtectedRoute>
                } />
                <Route path="/features/reflection" element={
                  <ProtectedRoute>
                    <ReflectionApp />
                  </ProtectedRoute>
                } />
                <Route path="/features/bucket-list" element={
                  <ProtectedRoute>
                    <BucketListApp />
                  </ProtectedRoute>
                } />
                <Route path="/my-community" element={
                  <ProtectedRoute>
                    <MyCommunity />
                  </ProtectedRoute>
                } />
                <Route path="/server/:serverId" element={
                  <ProtectedRoute>
                    <ServerView />
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
          </FeaturesProvider>
        </CommunityProvider>
      </HabitProvider>
    </AuthProvider>
  )
}

export default App