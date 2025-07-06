import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Features() {
  const navigate = useNavigate()

  const features = [
    {
      id: 'journaling',
      name: 'Journaling',
      icon: '📝',
      description: 'Write reflections and track your thoughts',
      color: 'linear-gradient(135deg, #667eea, #764ba2)',
      path: '/features/journaling'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: '📆',
      description: 'Track important dates and events',
      color: 'linear-gradient(135deg, #f093fb, #f5576c)',
      path: '/features/calendar'
    },
    {
      id: 'todo',
      name: 'To-Do List',
      icon: '✅',
      description: 'Manage tasks and stay organized',
      color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      path: '/features/todo'
    },
    {
      id: 'meal-tracker',
      name: 'Meal & Water Tracker',
      icon: '🍱',
      description: 'Track your daily nutrition and hydration',
      color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
      path: '/features/meal-tracker'
    },
    {
      id: 'finance',
      name: 'Finance Center',
      icon: '💰',
      description: 'Track expenses, budgets, savings, and more',
      color: 'linear-gradient(135deg, #ffeaa7, #fab1a0)',
      path: '/features/finance'
    },
    {
      id: 'school',
      name: 'School Organizer',
      icon: '🎓',
      description: 'Track homework, tests, and school tasks',
      color: 'linear-gradient(135deg, #74b9ff, #0984e3)',
      path: '/features/school'
    },
    {
      id: 'life-stats',
      name: 'Life Stats Dashboard',
      icon: '📊',
      description: 'View your personal growth analytics',
      color: 'linear-gradient(135deg, #fa709a, #fee140)',
      path: '/features/life-stats'
    },
    {
      id: 'future-letters',
      name: 'Letter to Future Self',
      icon: '✉️',
      description: 'Send messages to your future self',
      color: 'linear-gradient(135deg, #a8edea, #fed6e3)',
      path: '/features/future-letters'
    },
    {
      id: 'gratitude',
      name: 'Gratitude Wall',
      icon: '🙏',
      description: 'Daily gratitude practice and memories',
      color: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
      path: '/features/gratitude'
    },
    {
      id: 'reflection',
      name: 'Unpack My Day',
      icon: '🧠',
      description: 'End-of-day reflection and mindfulness',
      color: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      path: '/features/reflection'
    },
    {
      id: 'bucket-list',
      name: 'Bucket List Tracker',
      icon: '🪂',
      description: 'Track your dreams and life goals',
      color: 'linear-gradient(135deg, #fad0c4, #ffd1ff)',
      path: '/features/bucket-list'
    }
  ]

  return (
    <Layout title="Features">
      <div className="features-content">
        <div className="features-intro">
          <h2>Your Personal Toolkit</h2>
          <p>Access powerful tools to enhance your productivity and well-being</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="feature-app-card"
              onClick={() => navigate(feature.path)}
              style={{ background: feature.color }}
            >
              <div className="feature-app-icon">{feature.icon}</div>
              <div className="feature-app-name">{feature.name}</div>
              <div className="feature-app-description">{feature.description}</div>
            </div>
          ))}
        </div>
        
        <div className="features-footer">
          <p>More features coming soon! 🚀</p>
        </div>
      </div>
    </Layout>
  )
}