import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=24&h=24&fit=crop&crop=center' },
    { path: '/my-habits', label: 'Habits', icon: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=24&h=24&fit=crop&crop=center' },
    { path: '/progress', label: 'Progress', icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=24&h=24&fit=crop&crop=center' },
    { path: '/support', label: 'Support', icon: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=24&h=24&fit=crop&crop=center' }
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <img src={item.icon} alt={item.label} />
          </div>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}