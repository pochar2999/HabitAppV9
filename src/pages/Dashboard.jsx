import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="home-content">
        <div 
          className="habit-flow-card build-card" 
          onClick={() => navigate('/build-habits')}
        >
          <div className="card-background">
            <img 
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center" 
              alt="Build Habits" 
              className="card-image"
            />
          </div>
          <div className="card-content">
            <h3>Build a Habit</h3>
            <p>Start forming positive habits with proven methods</p>
          </div>
        </div>
        
        <div 
          className="habit-flow-card break-card" 
          onClick={() => navigate('/break-habits')}
        >
          <div className="card-background">
            <img 
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center" 
              alt="Break Habits" 
              className="card-image"
            />
          </div>
          <div className="card-content">
            <h3>Break a Habit</h3>
            <p>Overcome unwanted behaviors with targeted strategies</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}