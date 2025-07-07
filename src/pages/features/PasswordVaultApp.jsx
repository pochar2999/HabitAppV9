import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function PasswordVaultApp() {
  const {
    getPasswordEntries,
    addPasswordEntry,
    updatePasswordEntry,
    deletePasswordEntry,
    getVaultPin,
    updateVaultPin,
    verifyVaultPin
  } = useFeatures()

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingEntry, setDeletingEntry] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [entryForm, setEntryForm] = useState({
    platform: '',
    username: '',
    password: '',
    notes: ''
  })
  const [showPasswords, setShowPasswords] = useState({})
  const [saving, setSaving] = useState(false)

  const passwordEntries = getPasswordEntries()
  const hasPin = getVaultPin()

  useEffect(() => {
    // Check if PIN is set up
    if (!hasPin) {
      setShowPinSetup(true)
    }
  }, [hasPin])

  const handlePinSetup = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be exactly 4 digits')
      return
    }

    if (newPin !== confirmPin) {
      setPinError('PINs do not match')
      return
    }

    updateVaultPin(newPin)
    setShowPinSetup(false)
    setIsUnlocked(true)
    setNewPin('')
    setConfirmPin('')
    setPinError('')
  }

  const handlePinVerification = () => {
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinError('PIN must be exactly 4 digits')
      return
    }

    if (verifyVaultPin(pinInput)) {
      setIsUnlocked(true)
      setPinInput('')
      setPinError('')
    } else {
      setPinError('Incorrect PIN')
      setPinInput('')
    }
  }

  const handleLockVault = () => {
    setIsUnlocked(false)
    setPinInput('')
    setShowPasswords({})
    setSearchTerm('')
  }

  const handleAddEntry = () => {
    setEntryForm({
      platform: '',
      username: '',
      password: '',
      notes: ''
    })
    setEditingEntry(null)
    setShowAddModal(true)
  }

  const handleEditEntry = (entry) => {
    setEntryForm({
      platform: entry.platform,
      username: entry.username,
      password: entry.password,
      notes: entry.notes || ''
    })
    setEditingEntry(entry)
    setShowEditModal(true)
  }

  const handleSaveEntry = async () => {
    if (!entryForm.platform.trim() || !entryForm.username.trim() || !entryForm.password.trim()) {
      alert('Please fill in platform, username, and password')
      return
    }

    try {
      setSaving(true)
      
      const entryData = {
        platform: entryForm.platform.trim(),
        username: entryForm.username.trim(),
        password: entryForm.password.trim(),
        notes: entryForm.notes.trim()
      }

      if (editingEntry) {
        updatePasswordEntry(editingEntry.id, entryData)
        setShowEditModal(false)
      } else {
        addPasswordEntry(entryData)
        setShowAddModal(false)
      }
      
      setEntryForm({
        platform: '',
        username: '',
        password: '',
        notes: ''
      })
      setEditingEntry(null)
    } catch (error) {
      console.error('Error saving password entry:', error)
      alert('Error saving entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEntry = (entry) => {
    setDeletingEntry(entry)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (deletingEntry) {
      deletePasswordEntry(deletingEntry.id)
      setShowDeleteModal(false)
      setDeletingEntry(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeletingEntry(null)
  }

  const togglePasswordVisibility = (entryId) => {
    setShowPasswords(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }))
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setEntryForm({ ...entryForm, password })
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const filteredEntries = passwordEntries.filter(entry =>
    entry.platform.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // PIN Setup Screen
  if (showPinSetup) {
    return (
      <Layout title="🔐 Password Vault" showBackButton={true} backTo="/features">
        <div className="vault-content">
          <div className="pin-setup-screen">
            <div className="pin-setup-card">
              <div className="pin-setup-icon">🔐</div>
              <h2>Set Up Your Vault PIN</h2>
              <p>Create a 4-digit PIN to secure your password vault</p>
              
              <div className="pin-form">
                <div className="form-group">
                  <label htmlFor="newPin">Enter 4-digit PIN</label>
                  <input
                    type="password"
                    id="newPin"
                    value={newPin}
                    onChange={(e) => {
                      setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                      setPinError('')
                    }}
                    placeholder="••••"
                    maxLength="4"
                    className="pin-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPin">Confirm PIN</label>
                  <input
                    type="password"
                    id="confirmPin"
                    value={confirmPin}
                    onChange={(e) => {
                      setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                      setPinError('')
                    }}
                    placeholder="••••"
                    maxLength="4"
                    className="pin-input"
                  />
                </div>
                
                {pinError && (
                  <div className="pin-error">{pinError}</div>
                )}
                
                <button 
                  className="setup-pin-btn"
                  onClick={handlePinSetup}
                  disabled={!newPin || !confirmPin}
                >
                  🔒 Set Up Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // PIN Entry Screen
  if (!isUnlocked) {
    return (
      <Layout title="🔐 Password Vault" showBackButton={true} backTo="/features">
        <div className="vault-content">
          <div className="pin-entry-screen">
            <div className="pin-entry-card">
              <div className="vault-lock-icon">🔒</div>
              <h2>Enter Your PIN</h2>
              <p>Enter your 4-digit PIN to access your password vault</p>
              
              <div className="pin-form">
                <div className="form-group">
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))
                      setPinError('')
                    }}
                    placeholder="••••"
                    maxLength="4"
                    className="pin-input"
                    autoFocus
                  />
                </div>
                
                {pinError && (
                  <div className="pin-error">{pinError}</div>
                )}
                
                <button 
                  className="unlock-btn"
                  onClick={handlePinVerification}
                  disabled={pinInput.length !== 4}
                >
                  🔓 Unlock Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Main Vault Interface
  return (
    <Layout title="🔐 Password Vault" showBackButton={true} backTo="/features">
      <div className="vault-content">
        <div className="vault-header">
          <div className="vault-stats">
            <div className="stat-item">
              <span className="stat-value">{passwordEntries.length}</span>
              <span className="stat-label">Saved Passwords</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">🔓</span>
              <span className="stat-label">Unlocked</span>
            </div>
          </div>
          
          <div className="vault-actions">
            <button className="add-password-btn" onClick={handleAddEntry}>
              + Add Password
            </button>
            <button className="lock-vault-btn" onClick={handleLockVault}>
              🔒 Lock Vault
            </button>
          </div>
        </div>

        <div className="vault-search">
          <input
            type="text"
            placeholder="Search platforms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {filteredEntries.length === 0 ? (
          <div className="no-passwords">
            <div className="no-passwords-icon">🔐</div>
            <h3>No Passwords Saved</h3>
            <p>Start building your secure password vault!</p>
            <button className="start-vault-btn" onClick={handleAddEntry}>
              Add Your First Password
            </button>
          </div>
        ) : (
          <div className="passwords-list">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="password-card">
                <div className="password-header">
                  <div className="platform-info">
                    <div className="platform-icon">🌐</div>
                    <div className="platform-details">
                      <div className="platform-name">{entry.platform}</div>
                      <div className="username">{entry.username}</div>
                    </div>
                  </div>
                  <div className="password-actions">
                    <button 
                      className="edit-password-btn"
                      onClick={() => handleEditEntry(entry)}
                      title="Edit entry"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-password-btn"
                      onClick={() => handleDeleteEntry(entry)}
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="password-content">
                  <div className="password-field">
                    <label>Password:</label>
                    <div className="password-display">
                      <input
                        type={showPasswords[entry.id] ? 'text' : 'password'}
                        value={entry.password}
                        readOnly
                        className="password-input"
                      />
                      <button
                        className="toggle-password-btn"
                        onClick={() => togglePasswordVisibility(entry.id)}
                      >
                        {showPasswords[entry.id] ? '🙈' : '👁️'}
                      </button>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(entry.password, 'password')}
                        title="Copy password"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  {entry.notes && (
                    <div className="notes-field">
                      <label>Notes:</label>
                      <div className="notes-content">{entry.notes}</div>
                    </div>
                  )}
                </div>

                <div className="password-footer">
                  <div className="copy-actions">
                    <button
                      className="copy-username-btn"
                      onClick={() => copyToClipboard(entry.username, 'username')}
                    >
                      Copy Username
                    </button>
                  </div>
                  <div className="entry-date">
                    Added {new Date(entry.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Password Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🔐 Add New Password</h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="password-form">
                  <div className="form-group">
                    <label htmlFor="platform">Platform/App Name</label>
                    <input
                      type="text"
                      id="platform"
                      value={entryForm.platform}
                      onChange={(e) => setEntryForm({ ...entryForm, platform: e.target.value })}
                      placeholder="e.g., Gmail, Facebook, Netflix"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="username">Username/Email</label>
                    <input
                      type="text"
                      id="username"
                      value={entryForm.username}
                      onChange={(e) => setEntryForm({ ...entryForm, username: e.target.value })}
                      placeholder="your@email.com or username"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-group">
                      <input
                        type="text"
                        id="password"
                        value={entryForm.password}
                        onChange={(e) => setEntryForm({ ...entryForm, password: e.target.value })}
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        className="generate-password-btn"
                        onClick={generatePassword}
                        title="Generate secure password"
                      >
                        🎲
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      value={entryForm.notes}
                      onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveEntry}
                  disabled={saving || !entryForm.platform.trim() || !entryForm.username.trim() || !entryForm.password.trim()}
                >
                  {saving ? 'Saving...' : '🔒 Save Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Password Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>✏️ Edit Password</h3>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="password-form">
                  <div className="form-group">
                    <label htmlFor="editPlatform">Platform/App Name</label>
                    <input
                      type="text"
                      id="editPlatform"
                      value={entryForm.platform}
                      onChange={(e) => setEntryForm({ ...entryForm, platform: e.target.value })}
                      placeholder="e.g., Gmail, Facebook, Netflix"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="editUsername">Username/Email</label>
                    <input
                      type="text"
                      id="editUsername"
                      value={entryForm.username}
                      onChange={(e) => setEntryForm({ ...entryForm, username: e.target.value })}
                      placeholder="your@email.com or username"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="editPassword">Password</label>
                    <div className="password-input-group">
                      <input
                        type="text"
                        id="editPassword"
                        value={entryForm.password}
                        onChange={(e) => setEntryForm({ ...entryForm, password: e.target.value })}
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        className="generate-password-btn"
                        onClick={generatePassword}
                        title="Generate secure password"
                      >
                        🎲
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="editNotes">Notes (Optional)</label>
                    <textarea
                      id="editNotes"
                      value={entryForm.notes}
                      onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveEntry}
                  disabled={saving || !entryForm.platform.trim() || !entryForm.username.trim() || !entryForm.password.trim()}
                >
                  {saving ? 'Updating...' : '💾 Update Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={cancelDelete}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Delete Password Entry</h3>
                <button className="modal-close" onClick={cancelDelete}>×</button>
              </div>
              
              <div className="modal-body">
                <p>Are you sure you want to delete the password for <strong>{deletingEntry?.platform}</strong>? This action cannot be undone.</p>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={cancelDelete}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={confirmDelete} style={{ background: 'var(--error-color)' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}