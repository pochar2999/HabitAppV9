import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useCommunity } from '../contexts/CommunityContext'

export default function MyCommunity() {
  const navigate = useNavigate()
  const { userServers, loading, createServer, joinServer } = useCommunity()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', isPublic: true })
  const [joinCode, setJoinCode] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleCreateServer = async (e) => {
    e.preventDefault()
    
    if (!createForm.name.trim()) {
      showMessage('Please enter a server name', 'error')
      return
    }

    try {
      setActionLoading(true)
      const result = await createServer(createForm.name.trim(), createForm.isPublic)
      showMessage(`Server created! Join code: ${result.joinCode}`, 'success')
      setShowCreateModal(false)
      setCreateForm({ name: '', isPublic: true })
    } catch (error) {
      showMessage('Error creating server. Please try again.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoinServer = async (e) => {
    e.preventDefault()
    
    if (!joinCode.trim()) {
      showMessage('Please enter a join code', 'error')
      return
    }

    try {
      setActionLoading(true)
      const result = await joinServer(joinCode.trim())
      
      if (result.pending) {
        showMessage(`Join request sent to ${result.serverName}. Waiting for approval.`, 'success')
      } else {
        showMessage(`Successfully joined ${result.serverName}!`, 'success')
      }
      
      setShowJoinModal(false)
      setJoinCode('')
    } catch (error) {
      showMessage(error.message || 'Error joining server. Please try again.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  if (loading) {
    return (
      <Layout title="My Community">
        <div className="community-content">
          <div className="loading">Loading your servers...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="My Community">
      <div className="community-content">
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="community-actions">
          <button 
            className="community-action-btn create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="action-icon">✅</span>
            <div>
              <div className="action-title">Create Server</div>
              <div className="action-subtitle">Start your own community</div>
            </div>
          </button>

          <button 
            className="community-action-btn join-btn"
            onClick={() => setShowJoinModal(true)}
          >
            <span className="action-icon">🔑</span>
            <div>
              <div className="action-title">Join Server</div>
              <div className="action-subtitle">Enter a join code</div>
            </div>
          </button>
        </div>

        <div className="servers-section">
          <h3>Your Servers</h3>
          {userServers.length === 0 ? (
            <div className="no-servers">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=120&h=120&fit=crop&crop=center" 
                alt="No servers" 
                className="no-servers-image"
              />
              <p>You haven't joined any servers yet. Create one or join with a code!</p>
            </div>
          ) : (
            <div className="servers-list">
              {userServers.map((server) => (
                <div 
                  key={server.id} 
                  className="server-card"
                  onClick={() => navigate(`/server/${server.id}`)}
                >
                  <div className="server-info">
                    <div className="server-name">{server.name}</div>
                    <div className="server-details">
                      <span className="server-type">
                        {server.isPublic ? '🌐 Public' : '🔒 Private'}
                      </span>
                      <span className="server-members">
                        👥 {server.memberCount} members
                      </span>
                    </div>
                    <div className="server-code">Code: {server.joinCode}</div>
                  </div>
                  <div className="server-arrow">→</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Server Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create Server</h3>
                <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleCreateServer} className="modal-body">
                <div className="form-group">
                  <label htmlFor="serverName">Server Name</label>
                  <input
                    type="text"
                    id="serverName"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Enter server name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Server Type</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="serverType"
                        checked={createForm.isPublic}
                        onChange={() => setCreateForm({ ...createForm, isPublic: true })}
                      />
                      <span>🌐 Public - Anyone with code can join</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="serverType"
                        checked={!createForm.isPublic}
                        onChange={() => setCreateForm({ ...createForm, isPublic: false })}
                      />
                      <span>🔒 Private - Owner approval required</span>
                    </label>
                  </div>
                </div>
              </form>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  onClick={handleCreateServer}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Creating...' : 'Create Server'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Server Modal */}
        {showJoinModal && (
          <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Join Server</h3>
                <button className="modal-close" onClick={() => setShowJoinModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleJoinServer} className="modal-body">
                <div className="form-group">
                  <label htmlFor="joinCode">Join Code</label>
                  <input
                    type="text"
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code (e.g., H7X2PL)"
                    maxLength="6"
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>
              </form>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  onClick={handleJoinServer}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Joining...' : 'Join Server'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}