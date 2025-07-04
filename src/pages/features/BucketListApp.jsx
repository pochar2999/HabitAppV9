import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function BucketListApp() {
  const { 
    getBucketListItems, 
    addBucketListItem, 
    updateBucketListItem,
    deleteBucketListItem,
    completeBucketListItem
  } = useFeatures()

  const [showAddModal, setShowAddModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('created') // 'created', 'category', 'completed'
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium'
  })
  const [saving, setSaving] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const bucketListItems = getBucketListItems()
  
  const categories = {
    travel: { label: 'Travel', icon: '✈️', color: '#74b9ff' },
    skills: { label: 'Skills', icon: '🎯', color: '#a29bfe' },
    personal: { label: 'Personal', icon: '🌱', color: '#55a3ff' },
    career: { label: 'Career', icon: '💼', color: '#fdcb6e' },
    adventure: { label: 'Adventure', icon: '🏔️', color: '#fd79a8' },
    creative: { label: 'Creative', icon: '🎨', color: '#00cec9' },
    health: { label: 'Health', icon: '💪', color: '#00b894' },
    relationships: { label: 'Relationships', icon: '❤️', color: '#e17055' }
  }

  const priorities = {
    low: { label: 'Someday', color: '#b2bec3' },
    medium: { label: 'This Year', color: '#fdcb6e' },
    high: { label: 'Priority', color: '#e17055' }
  }

  const handleAddItem = () => {
    setItemForm({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium'
    })
    setShowAddModal(true)
  }

  const handleSaveItem = async () => {
    if (!itemForm.title.trim()) {
      alert('Please enter a title for your goal')
      return
    }

    try {
      setSaving(true)
      
      addBucketListItem({
        title: itemForm.title.trim(),
        description: itemForm.description.trim(),
        category: itemForm.category,
        priority: itemForm.priority
      })
      
      setShowAddModal(false)
      setItemForm({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium'
      })
    } catch (error) {
      console.error('Error saving bucket list item:', error)
      alert('Error saving item. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteItem = (itemId) => {
    completeBucketListItem(itemId)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteBucketListItem(itemId)
    }
  }

  const getFilteredAndSortedItems = () => {
    let filtered = bucketListItems

    if (filterCategory !== 'all') {
      if (filterCategory === 'completed') {
        filtered = filtered.filter(item => item.completed)
      } else if (filterCategory === 'active') {
        filtered = filtered.filter(item => !item.completed)
      } else {
        filtered = filtered.filter(item => item.category === filterCategory)
      }
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'category':
          return a.category.localeCompare(b.category)
        case 'completed':
          return a.completed === b.completed ? 0 : a.completed ? 1 : -1
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })
  }

  const getStats = () => {
    const total = bucketListItems.length
    const completed = bucketListItems.filter(item => item.completed).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { total, completed, percentage }
  }

  const stats = getStats()
  const filteredItems = getFilteredAndSortedItems()

  return (
    <Layout title="🪂 Bucket List Tracker" showBackButton={true} backTo="/features">
      <div className="bucket-list-content">
        {showConfetti && (
          <div className="confetti-overlay">
            <div className="confetti">🎉</div>
            <div className="confetti">🎊</div>
            <div className="confetti">✨</div>
            <div className="confetti">🌟</div>
            <div className="confetti">🎈</div>
          </div>
        )}

        <div className="bucket-list-header">
          <div className="stats-section">
            <div className="progress-circle">
              <svg width="80" height="80">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="#48bb78"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - stats.percentage / 100)}`}
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div className="progress-text">
                <div className="progress-percentage">{stats.percentage}%</div>
                <div className="progress-label">Complete</div>
              </div>
            </div>
            
            <div className="stats-details">
              <div className="stat-item">
                <span className="stat-value">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.total - stats.completed}</span>
                <span className="stat-label">Remaining</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Goals</span>
              </div>
            </div>
          </div>

          <button className="add-goal-btn" onClick={handleAddItem}>
            + Add Goal
          </button>
        </div>

        <div className="bucket-list-controls">
          <div className="filter-section">
            <label>Filter:</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Goals</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <hr />
              {Object.entries(categories).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-section">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="created">Date Added</option>
              <option value="category">Category</option>
              <option value="priority">Priority</option>
              <option value="completed">Status</option>
            </select>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="no-goals">
            <div className="no-goals-icon">🪂</div>
            <h3>No Goals Yet</h3>
            <p>Start building your bucket list of dreams and aspirations!</p>
            <button className="start-goals-btn" onClick={handleAddItem}>
              Add Your First Goal
            </button>
          </div>
        ) : (
          <div className="goals-grid">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`goal-card ${item.completed ? 'completed' : ''}`}
                style={{ borderLeft: `4px solid ${categories[item.category]?.color}` }}
              >
                <div className="goal-header">
                  <div className="goal-category">
                    <span className="category-icon">{categories[item.category]?.icon}</span>
                    <span className="category-name">{categories[item.category]?.label}</span>
                  </div>
                  <div className="goal-actions">
                    {!item.completed && (
                      <button 
                        className="complete-goal-btn"
                        onClick={() => handleCompleteItem(item.id)}
                        title="Mark as completed"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      className="delete-goal-btn"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete goal"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="goal-content">
                  <h4 className="goal-title">{item.title}</h4>
                  {item.description && (
                    <p className="goal-description">{item.description}</p>
                  )}
                </div>

                <div className="goal-footer">
                  <div 
                    className="goal-priority"
                    style={{ color: priorities[item.priority]?.color }}
                  >
                    {priorities[item.priority]?.label}
                  </div>
                  {item.completed && (
                    <div className="completion-badge">
                      🎉 Completed!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Goal Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🪂 Add New Goal</h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="goal-form">
                  <div className="form-group">
                    <label htmlFor="goalTitle">Goal Title</label>
                    <input
                      type="text"
                      id="goalTitle"
                      value={itemForm.title}
                      onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                      placeholder="e.g., Learn to play guitar, Visit Japan, Run a marathon"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="goalDescription">Description (Optional)</label>
                    <textarea
                      id="goalDescription"
                      value={itemForm.description}
                      onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                      placeholder="Add more details about this goal..."
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="goalCategory">Category</label>
                      <select
                        id="goalCategory"
                        value={itemForm.category}
                        onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      >
                        {Object.entries(categories).map(([key, cat]) => (
                          <option key={key} value={key}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="goalPriority">Priority</label>
                      <select
                        id="goalPriority"
                        value={itemForm.priority}
                        onChange={(e) => setItemForm({ ...itemForm, priority: e.target.value })}
                      >
                        {Object.entries(priorities).map(([key, priority]) => (
                          <option key={key} value={key}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveItem}
                  disabled={saving || !itemForm.title.trim()}
                >
                  {saving ? 'Adding...' : '🎯 Add Goal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}