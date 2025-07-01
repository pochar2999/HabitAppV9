import React from 'react'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout({ children, title, showBackButton = false, backTo = "/" }) {
  return (
    <div className="screen">
      <Header title={title} showBackButton={showBackButton} backTo={backTo} />
      {children}
      <BottomNav />
    </div>
  )
}