import React from 'react'
import { useHabits } from '../contexts/HabitContext'

export default function WeeklyProgress() {
  const { getWeeklyProgress } = useHabits()
  const weekData = getWeeklyProgress()

  const getProgressColor = (percentage) => {
    if (percentage === 0) return '#e2e8f0'
    if (percentage < 50) return '#fc8181'
    if (percentage < 80) return '#f6ad55'
    return '#68d391'
  }

  const getProgressStroke = (percentage) => {
    if (percentage === 0) return 'rgba(255, 255, 255, 0.3)'
    if (percentage < 50) return '#f56565'
    if (percentage < 80) return '#ed8936'
    return '#48bb78'
  }

  return (
    <div className="weekly-progress">
      <h3>Weekly Progress</h3>
      <div className="progress-chart">
        {weekData.map((day, index) => {
          const circumference = 2 * Math.PI * 16
          const strokeDasharray = circumference
          const strokeDashoffset = circumference - (day.percentage / 100) * circumference

          return (
            <div key={index} className="progress-day">
              <div className="progress-circle">
                <svg width="40" height="40">
                  <circle
                    className="bg-circle"
                    cx="20"
                    cy="20"
                    r="16"
                  />
                  <circle
                    className="progress-ring"
                    cx="20"
                    cy="20"
                    r="16"
                    stroke={getProgressStroke(day.percentage)}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="progress-tooltip">
                  {day.completedHabits}/{day.totalHabits} habits completed
                  <br />
                  {Math.round(day.percentage)}%
                </div>
              </div>
              <div className="progress-day-label">{day.day}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}