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