import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function TodoApp() {
  const { 
    getActiveTodoItems, 
    getCompletedTodoItems, 
    addTodoItem, 
    completeTodoItem, 
    deleteTodoItem 
  } = useFeatures()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [todoForm, setTodoForm] = useState({
    title: '',
    dueDate: ''
  })

  const activeTodos = getActiveTodoItems()
  const completedTodos = getCompletedTodoItems()

  const handleAddTodo = () => {
    setTodoForm({ title: '', dueDate: '' })
    setShowAddModal(true)
  }

  const handleSaveTodo = () => {
    if (!todoForm.title.trim()) {
      alert('Please enter a task title')
      return
    }

    addTodoItem(
      todoForm.title,
      todoForm.dueDate || null
    )

    setShowAddModal(false)
    setTodoForm({ title: '', dueDate: '' })
  }

  const handleCompleteTodo = (todoId) => {
    completeTodoItem(todoId)
  }

  const handleDeleteTodo = (todoId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTodoItem(todoId)
    }
  }

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null
    
    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return { text: 'Due Today', class: 'due-today' }
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return { text: 'Due Tomorrow', class: 'due-tomorrow' }
    } else if (date < today) {
      return { text: 'Overdue', class: 'overdue' }
    } else {
      return { 
        text: `Due ${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`, 
        class: 'due-later' 
      }
    }
  }

  const formatCompletedDate = (completedAt) => {
    const date = new Date(completedAt)
    const today = new Date()
    
    if (date.toDateString() === today.toDateString()) {
      return `Completed today at ${date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return `Completed ${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`
    }
  }

  return (
    <Layout title="✅ To-Do List" showBackButton={true} backTo="/features">
      <div className="todo-app-content">
        <div className="todo-header">
          <button className="add-todo-btn" onClick={handleAddTodo}>
            + Add Task
          </button>
        </div>

        <div className="todo-sections">
          {/* Active Tasks */}
          <div className="active-todos-section">
            <h3>Active Tasks ({activeTodos.length})</h3>
            {activeTodos.length === 0 ? (
              <div className="no-todos">
                <div className="no-todos-icon">✅</div>
                <p>No active tasks. Add one to get started!</p>
              </div>
            ) : (
              <div className="todos-list">
                {activeTodos.map(todo => {
                  const dueDateInfo = formatDueDate(todo.dueDate)
                  
                  return (
                    <div key={todo.id} className="todo-card">
                      <div className="todo-content">
                        <button 
                          className="complete-todo-btn"
                          onClick={() => handleCompleteTodo(todo.id)}
                        >
                          ○
                        </button>
                        <div className="todo-details">
                          <div className="todo-title">{todo.title}</div>
                          {dueDateInfo && (
                            <div className={`todo-due-date ${dueDateInfo.class}`}>
                              {dueDateInfo.text}
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        className="delete-todo-btn"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {completedTodos.length > 0 && (
            <div className="completed-todos-section">
              <button 
                className="toggle-completed-btn"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? 'Hide Completed' : 'Show Completed'} ({completedTodos.length})
              </button>
              
              {showCompleted && (
                <div className="completed-todos-list">
                  {completedTodos.map(todo => (
                    <div key={todo.id} className="todo-card completed">
                      <div className="todo-content">
                        <div className="completed-todo-icon">✓</div>
                        <div className="todo-details">
                          <div className="todo-title">{todo.title}</div>
                          <div className="todo-completed-date">
                            {formatCompletedDate(todo.completedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="completed-note">
                    <p>✨ Completed tasks will automatically disappear after 24 hours</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Todo Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Task</h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="todo-form">
                  <div className="form-group">
                    <label htmlFor="todoTitle">Task Title</label>
                    <input
                      type="text"
                      id="todoTitle"
                      value={todoForm.title}
                      onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
                      placeholder="What needs to be done?"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="todoDueDate">Due Date (Optional)</label>
                    <input
                      type="date"
                      id="todoDueDate"
                      value={todoForm.dueDate}
                      onChange={(e) => setTodoForm({ ...todoForm, dueDate: e.target.value })}
                    />
                    <small className="form-hint">
                      Tasks with due dates will be added to your calendar
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveTodo}
                  disabled={!todoForm.title.trim()}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}