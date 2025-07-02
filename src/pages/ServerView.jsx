import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useCommunity } from '../contexts/CommunityContext'
import { useAuth } from '../contexts/AuthContext'
import { useHabits } from '../contexts/HabitContext'

export default function ServerView() {
  const { serverId } = useParams()
  const navigate = useNavigate()
  const { currentUser, getUserData } = useAuth()
  const { getActiveHabitsCount, getCurrentStreak } = useHabits()
  const { 
    getServerDetails, 
    leaveServer, 
    sendMotivation, 
    getPendingRequests, 
    handleJoinRequest 
  } = useCommunity()

  const [server, setServer] = useState(null)
  const [memberStats, setMemberStats] = useState({})
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  useEffect(() => {
    loadServerData()
  }, [serverId])

  const loadServerData = async () => {
    try {
      setLoading(true)
      const serverData = await getServerDetails(serverId)
      setServer(serverData)

      // Load member stats
      const stats = {}
      for (const memberId of serverData.members) {
        try {
          const userData = await getUserData(memberId)
          if (userData) {
            // Calculate stats from user's habit data
            const habits = userData.habits || {}
            const habitCompletion = userData.habitCompletion || {}
            const activityLog = userData.activityLog || {}

            const activeHabits = Object.keys(habits).length
            
            // Calculate current streak
            let currentStreak = 0
            const dates = Object.keys(activityLog).sort().reverse()
            const today = new Date().toISOString().split('T')[0]
            let currentDate = new Date()
            
            while (true) {
              const dateStr = currentDate.toISOString().split('T')[0]
              if (activityLog[dateStr]) {
                currentStreak++
                currentDate.setDate(currentDate.getDate() - 1)
              } else {
                break
              }
            }

            stats[memberId] = {
              activeHabits,
              currentStreak,
              name: serverData.memberDetails[memberId]?.name || 'Unknown User'
            }
          }
        } catch (error) {
          console.error(`Error loading stats for member ${memberId}:`, error)
          stats[memberId] = {
            activeHabits: 0,
            currentStreak: 0,
            name: serverData.memberDetails[memberId]?.name || 'Unknown User'
          }
        }
      }
      setMemberStats(stats)

      // Load pending requests if user is owner
      if (serverData.ownerId === currentUser.uid) {
        const requests = await getPendingRequests(serverId)
        setPendingRequests(requests)
      }
    } catch (error) {
      console.error('Error loading server data:', error)
      showMessage('Error loading server data', 'error')
      navigate('/my-community')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveServer = async () => {
    if (!window.confirm('Are you sure you want to leave this server?')) {
      return
    }

    try {
      setActionLoading(true)
      await leaveServer(serverId)
      showMessage('Left server successfully', 'success')
      setTimeout(() => navigate('/my-community'), 1000)
    } catch (error) {
      showMessage('Error leaving server', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendMotivation = async (targetUserId) => {
    try {
      await sendMotivation(targetUserId, serverId)
      showMessage('Motivation sent! 💪', 'success')
    } catch (error) {
      showMessage('Error sending motivation', 'error')
    }
  }

  const handleJoinRequestAction = async (requestId, approve) => {
    try {
      await handleJoinRequest(serverId, requestId, approve)
      showMessage(approve ? 'Request approved!' : 'Request rejected', 'success')
      await loadServerData() // Reload to update member list and requests
    } catch (error) {
      showMessage('Error handling request', 'error')
    }
  }

  const showMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <Layout title="Loading..." showBackButton={true} backTo="/my-community">
        <div className="server-content">
          <div className="loading">Loading server...</div>
        </div>
      </Layout>
    )
  }

  if (!server) {
    return (
      <Layout title="Server Not Found" showBackButton={true} backTo="/my-community">
        <div className="server-content">
          <div className="error">Server not found or you don't have access.</div>
        </div>
      </Layout>
    )
  }

  const isOwner = server.ownerId === currentUser.uid

  return (
    <Layout title={server.name} showBackButton={true} backTo="/my-community">
      <div className="server-content">
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="server-header">
          <div className="server-info">
            <h2>{server.name}</h2>
            <div className="server-meta">
              <span className="server-type">
                {server.isPublic ? '🌐 Public' : '🔒 Private'}
              </span>
              <span className="server-code">Code: {server.joinCode}</span>
            </div>
            {isOwner && (
              <div className="owner-badge">👑 Owner</div>
            )}
          </div>
          
          {!isOwner && (
            <button 
              className="leave-server-btn"
              onClick={handleLeaveServer}
              disabled={actionLoading}
            >
              {actionLoading ? 'Leaving...' : 'Leave Server'}
            </button>
          )}
        </div>

        {/* Pending Requests (Owner Only) */}
        {isOwner && pendingRequests.length > 0 && (
          <div className="pending-requests-section">
            <h3>Pending Join Requests</h3>
            <div className="requests-list">
              {pendingRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-info">
                    <div className="request-name">{request.userName}</div>
                    <div className="request-email">{request.userEmail}</div>
                    <div className="request-date">
                      Requested: {new Date(request.requestedAt.toDate()).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="request-actions">
                    <button 
                      className="approve-btn"
                      onClick={() => handleJoinRequestAction(request.id, true)}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleJoinRequestAction(request.id, false)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="members-section">
          <h3>Members ({server.memberCount})</h3>
          <div className="members-list">
            {server.members.map((memberId) => {
              const stats = memberStats[memberId] || { activeHabits: 0, currentStreak: 0, name: 'Loading...' }
              const isCurrentUser = memberId === currentUser.uid
              
              return (
                <div key={memberId} className="member-card">
                  <div className="member-info">
                    <div className="member-header">
                      <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face" 
                        alt="Profile" 
                        className="member-avatar"
                      />
                      <div>
                        <div className="member-name">
                          {stats.name}
                          {isCurrentUser && <span className="you-badge">(You)</span>}
                          {memberId === server.ownerId && <span className="owner-badge">👑</span>}
                        </div>
                        <div className="member-email">
                          {server.memberDetails[memberId]?.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="member-stats">
                      <div className="stat">
                        <span className="stat-value">🔥 {stats.currentStreak}</span>
                        <span className="stat-label">Day Streak</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{stats.activeHabits}</span>
                        <span className="stat-label">Active Habits</span>
                      </div>
                    </div>
                  </div>
                  
                  {!isCurrentUser && (
                    <button 
                      className="motivate-btn"
                      onClick={() => handleSendMotivation(memberId)}
                    >
                      💪 Motivate
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}