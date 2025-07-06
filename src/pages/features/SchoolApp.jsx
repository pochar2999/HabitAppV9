import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function SchoolApp() {
  const {
    getSchoolTasks,
    addSchoolTask,
    updateSchoolTask,
    completeSchoolTask,
    deleteSchoolTask,
    getSchoolSubjects,
    addSchoolSubject,
    updateSchoolSubject,
    deleteSchoolSubject,
    getSchoolGrades,
    addSchoolGrade,
    updateSchoolGrade,
    deleteSchoolGrade,
    getStudySchedule,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    getSchoolSettings,
    updateSchoolSettings,
    calculateGPA
  } = useFeatures()

  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'tasks', 'grades', 'schedule', 'subjects'
  const [viewMode, setViewMode] = useState('list') // 'list', 'calendar', 'subject'
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [modalType, setModalType] = useState('')

  const [taskForm, setTaskForm] = useState({
    type: 'homework',
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    reminderTime: '',
    priority: 'medium'
  })

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    teacher: '',
    room: '',
    credits: '',
    color: '#667eea'
  })

  const [gradeForm, setGradeForm] = useState({
    subject: '',
    assignment: '',
    grade: '',
    points: '',
    maxPoints: '',
    credits: '',
    date: new Date().toISOString().split('T')[0],
    type: 'assignment'
  })

  const [scheduleForm, setScheduleForm] = useState({
    subject: '',
    dayOfWeek: 'monday',
    startTime: '',
    endTime: '',
    duration: '',
    location: '',
    notes: ''
  })

  const tasks = getSchoolTasks()
  const subjects = getSchoolSubjects()
  const grades = getSchoolGrades()
  const schedule = getStudySchedule()
  const settings = getSchoolSettings()
  const gpa = calculateGPA()

  const taskTypes = {
    homework: { label: 'Homework', icon: '📝', color: '#667eea' },
    quiz: { label: 'Quiz', icon: '📋', color: '#f093fb' },
    test: { label: 'Test', icon: '📊', color: '#ff6b6b' },
    project: { label: 'Project', icon: '🎯', color: '#4ecdc4' }
  }

  const priorities = {
    low: { label: 'Low', color: '#95a5a6' },
    medium: { label: 'Medium', color: '#f39c12' },
    high: { label: 'High', color: '#e74c3c' }
  }

  const gradeTypes = {
    assignment: 'Assignment',
    quiz: 'Quiz',
    test: 'Test',
    project: 'Project',
    midterm: 'Midterm',
    final: 'Final Exam'
  }

  const daysOfWeek = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  const handleAddTask = () => {
    setTaskForm({
      type: 'homework',
      title: '',
      subject: subjects.length > 0 ? subjects[0].name : '',
      description: '',
      dueDate: '',
      reminderTime: '',
      priority: 'medium'
    })
    setEditingItem(null)
    setModalType('task')
    setShowAddModal(true)
  }

  const handleEditTask = (task) => {
    setTaskForm({
      type: task.type,
      title: task.title,
      subject: task.subject,
      description: task.description || '',
      dueDate: task.dueDate || '',
      reminderTime: task.reminderTime || '',
      priority: task.priority
    })
    setEditingItem(task)
    setModalType('task')
    setShowAddModal(true)
  }

  const handleSaveTask = () => {
    if (!taskForm.title.trim() || !taskForm.subject) {
      alert('Please fill in title and subject')
      return
    }

    const taskData = {
      type: taskForm.type,
      title: taskForm.title.trim(),
      subject: taskForm.subject,
      description: taskForm.description.trim(),
      dueDate: taskForm.dueDate || null,
      reminderTime: taskForm.reminderTime || null,
      priority: taskForm.priority
    }

    if (editingItem) {
      updateSchoolTask(editingItem.id, taskData)
    } else {
      addSchoolTask(taskData)
    }

    setShowAddModal(false)
    setEditingItem(null)
  }

  const handleAddSubject = () => {
    setSubjectForm({
      name: '',
      teacher: '',
      room: '',
      credits: '',
      color: '#667eea'
    })
    setEditingItem(null)
    setShowSubjectModal(true)
  }

  const handleEditSubject = (subject) => {
    setSubjectForm({
      name: subject.name,
      teacher: subject.teacher || '',
      room: subject.room || '',
      credits: subject.credits?.toString() || '',
      color: subject.color || '#667eea'
    })
    setEditingItem(subject)
    setShowSubjectModal(true)
  }

  const handleSaveSubject = () => {
    if (!subjectForm.name.trim()) {
      alert('Please enter subject name')
      return
    }

    const subjectData = {
      name: subjectForm.name.trim(),
      teacher: subjectForm.teacher.trim(),
      room: subjectForm.room.trim(),
      credits: parseFloat(subjectForm.credits) || 0,
      color: subjectForm.color
    }

    if (editingItem) {
      updateSchoolSubject(editingItem.id, subjectData)
    } else {
      addSchoolSubject(subjectData)
    }

    setShowSubjectModal(false)
    setEditingItem(null)
  }

  const handleAddGrade = () => {
    setGradeForm({
      subject: subjects.length > 0 ? subjects[0].name : '',
      assignment: '',
      grade: '',
      points: '',
      maxPoints: '',
      credits: '',
      date: new Date().toISOString().split('T')[0],
      type: 'assignment'
    })
    setEditingItem(null)
    setShowGradeModal(true)
  }

  const handleEditGrade = (grade) => {
    setGradeForm({
      subject: grade.subject,
      assignment: grade.assignment,
      grade: grade.grade,
      points: grade.points?.toString() || '',
      maxPoints: grade.maxPoints?.toString() || '',
      credits: grade.credits?.toString() || '',
      date: grade.date,
      type: grade.type
    })
    setEditingItem(grade)
    setShowGradeModal(true)
  }

  const handleSaveGrade = () => {
    if (!gradeForm.subject || !gradeForm.assignment || !gradeForm.grade) {
      alert('Please fill in subject, assignment, and grade')
      return
    }

    const gradeData = {
      subject: gradeForm.subject,
      assignment: gradeForm.assignment.trim(),
      grade: gradeForm.grade,
      points: parseFloat(gradeForm.points) || null,
      maxPoints: parseFloat(gradeForm.maxPoints) || null,
      credits: parseFloat(gradeForm.credits) || 1,
      date: gradeForm.date,
      type: gradeForm.type
    }

    if (editingItem) {
      updateSchoolGrade(editingItem.id, gradeData)
    } else {
      addSchoolGrade(gradeData)
    }

    setShowGradeModal(false)
    setEditingItem(null)
  }

  const handleAddSchedule = () => {
    setScheduleForm({
      subject: subjects.length > 0 ? subjects[0].name : '',
      dayOfWeek: 'monday',
      startTime: '',
      endTime: '',
      duration: '',
      location: '',
      notes: ''
    })
    setEditingItem(null)
    setShowScheduleModal(true)
  }

  const handleEditSchedule = (session) => {
    setScheduleForm({
      subject: session.subject,
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration?.toString() || '',
      location: session.location || '',
      notes: session.notes || ''
    })
    setEditingItem(session)
    setShowScheduleModal(true)
  }

  const handleSaveSchedule = () => {
    if (!scheduleForm.subject || !scheduleForm.startTime) {
      alert('Please fill in subject and start time')
      return
    }

    const sessionData = {
      subject: scheduleForm.subject,
      dayOfWeek: scheduleForm.dayOfWeek,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime || null,
      duration: parseFloat(scheduleForm.duration) || null,
      location: scheduleForm.location.trim(),
      notes: scheduleForm.notes.trim()
    }

    if (editingItem) {
      updateStudySession(editingItem.id, sessionData)
    } else {
      addStudySession(sessionData)
    }

    setShowScheduleModal(false)
    setEditingItem(null)
  }

  const handleDelete = (type, item) => {
    setDeleteItem({ type, item })
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (deleteItem) {
      switch (deleteItem.type) {
        case 'task':
          deleteSchoolTask(deleteItem.item.id)
          break
        case 'subject':
          deleteSchoolSubject(deleteItem.item.id)
          break
        case 'grade':
          deleteSchoolGrade(deleteItem.item.id)
          break
        case 'schedule':
          deleteStudySession(deleteItem.item.id)
          break
      }
      setShowDeleteModal(false)
      setDeleteItem(null)
    }
  }

  const getUpcomingTasks = () => {
    const now = new Date()
    const upcoming = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false
      const dueDate = new Date(task.dueDate)
      const diffTime = dueDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 7
    })
    return upcoming.slice(0, 5)
  }

  const getSubjectGPA = (subjectName) => {
    const subjectGrades = grades.filter(grade => grade.subject === subjectName)
    if (subjectGrades.length === 0) return 0

    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    }

    let totalPoints = 0
    let totalCredits = 0

    subjectGrades.forEach(grade => {
      const points = gradePoints[grade.grade] || 0
      const credits = grade.credits || 1
      totalPoints += points * credits
      totalCredits += credits
    })

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0
  }

  const renderOverview = () => {
    const upcomingTasks = getUpcomingTasks()
    const completedTasks = tasks.filter(task => task.completed).length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return (
      <div className="school-overview">
        <div className="overview-stats">
          <div className="stat-card gpa">
            <div className="stat-icon">🎓</div>
            <div className="stat-content">
              <div className="stat-value">{gpa}</div>
              <div className="stat-label">Current GPA</div>
            </div>
          </div>
          
          <div className="stat-card tasks">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-value">{tasks.filter(t => !t.completed).length}</div>
              <div className="stat-label">Pending Tasks</div>
            </div>
          </div>
          
          <div className="stat-card completion">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{completionRate}%</div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
          
          <div className="stat-card subjects">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-value">{subjects.length}</div>
              <div className="stat-label">Subjects</div>
            </div>
          </div>
        </div>

        <div className="overview-sections">
          <div className="upcoming-tasks-section">
            <h3>📅 Upcoming Deadlines</h3>
            {upcomingTasks.length === 0 ? (
              <div className="no-upcoming">
                <p>No upcoming deadlines in the next 7 days!</p>
              </div>
            ) : (
              <div className="upcoming-tasks-list">
                {upcomingTasks.map(task => {
                  const dueDate = new Date(task.dueDate)
                  const now = new Date()
                  const diffTime = dueDate - now
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  
                  return (
                    <div key={task.id} className="upcoming-task-card">
                      <div className="task-type-icon">
                        {taskTypes[task.type]?.icon}
                      </div>
                      <div className="task-details">
                        <div className="task-title">{task.title}</div>
                        <div className="task-subject">{task.subject}</div>
                      </div>
                      <div className="task-due">
                        <div className={`due-badge ${diffDays <= 1 ? 'urgent' : diffDays <= 3 ? 'soon' : 'normal'}`}>
                          {diffDays === 0 ? 'Due Today' : 
                           diffDays === 1 ? 'Due Tomorrow' : 
                           `${diffDays} days`}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="subjects-overview-section">
            <h3>📚 Subject Performance</h3>
            {subjects.length === 0 ? (
              <div className="no-subjects">
                <p>No subjects added yet.</p>
                <button className="add-subject-btn" onClick={handleAddSubject}>
                  Add Your First Subject
                </button>
              </div>
            ) : (
              <div className="subjects-performance">
                {subjects.map(subject => {
                  const subjectGPA = getSubjectGPA(subject.name)
                  const subjectTasks = tasks.filter(task => task.subject === subject.name && !task.completed).length
                  
                  return (
                    <div key={subject.id} className="subject-performance-card">
                      <div 
                        className="subject-color-bar" 
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="subject-info">
                        <div className="subject-name">{subject.name}</div>
                        <div className="subject-teacher">{subject.teacher}</div>
                      </div>
                      <div className="subject-stats">
                        <div className="subject-gpa">GPA: {subjectGPA}</div>
                        <div className="subject-tasks">{subjectTasks} pending</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="quick-actions">
          <button className="quick-action-btn" onClick={handleAddTask}>
            📝 Add Task
          </button>
          <button className="quick-action-btn" onClick={handleAddGrade}>
            📊 Add Grade
          </button>
          <button className="quick-action-btn" onClick={handleAddSubject}>
            📚 Add Subject
          </button>
          <button className="quick-action-btn" onClick={handleAddSchedule}>
            ⏰ Add Study Session
          </button>
        </div>
      </div>
    )
  }

  const renderTasks = () => (
    <div className="tasks-view">
      <div className="tasks-header">
        <h3>School Tasks</h3>
        <div className="tasks-controls">
          <div className="view-mode-selector">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
            <button 
              className={`view-btn ${viewMode === 'subject' ? 'active' : ''}`}
              onClick={() => setViewMode('subject')}
            >
              📚 By Subject
            </button>
          </div>
          <button className="add-task-btn" onClick={handleAddTask}>
            + Add Task
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="no-tasks">
          <div className="no-tasks-icon">📝</div>
          <h3>No School Tasks Yet</h3>
          <p>Start tracking your homework, tests, and projects!</p>
          <button className="start-tasks-btn" onClick={handleAddTask}>
            Add Your First Task
          </button>
        </div>
      ) : (
        <div className="tasks-content">
          {viewMode === 'list' ? (
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                  <div className="task-type">
                    <div 
                      className="type-indicator"
                      style={{ backgroundColor: taskTypes[task.type]?.color }}
                    >
                      {taskTypes[task.type]?.icon}
                    </div>
                  </div>
                  
                  <div className="task-content">
                    <div className="task-header">
                      <div className="task-title">{task.title}</div>
                      <div className="task-actions">
                        {!task.completed && (
                          <button 
                            className="complete-task-btn"
                            onClick={() => completeSchoolTask(task.id)}
                          >
                            ✓
                          </button>
                        )}
                        <button 
                          className="edit-task-btn"
                          onClick={() => handleEditTask(task)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-task-btn"
                          onClick={() => handleDelete('task', task)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="task-meta">
                      <span className="task-subject">{task.subject}</span>
                      <span className="task-type-label">{taskTypes[task.type]?.label}</span>
                      <span className={`task-priority ${task.priority}`}>
                        {priorities[task.priority]?.label}
                      </span>
                    </div>
                    
                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}
                    
                    {task.dueDate && (
                      <div className="task-due-date">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tasks-by-subject">
              {subjects.map(subject => {
                const subjectTasks = tasks.filter(task => task.subject === subject.name)
                if (subjectTasks.length === 0) return null
                
                return (
                  <div key={subject.id} className="subject-tasks-section">
                    <div className="subject-header">
                      <div 
                        className="subject-color"
                        style={{ backgroundColor: subject.color }}
                      />
                      <h4>{subject.name}</h4>
                      <span className="task-count">({subjectTasks.length})</span>
                    </div>
                    
                    <div className="subject-tasks-list">
                      {subjectTasks.map(task => (
                        <div key={task.id} className={`task-card compact ${task.completed ? 'completed' : ''}`}>
                          <div className="task-type-icon">
                            {taskTypes[task.type]?.icon}
                          </div>
                          <div className="task-info">
                            <div className="task-title">{task.title}</div>
                            {task.dueDate && (
                              <div className="task-due">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div className="task-actions">
                            {!task.completed && (
                              <button 
                                className="complete-task-btn"
                                onClick={() => completeSchoolTask(task.id)}
                              >
                                ✓
                              </button>
                            )}
                            <button 
                              className="edit-task-btn"
                              onClick={() => handleEditTask(task)}
                            >
                              ✏️
                            </button>
                            <button 
                              className="delete-task-btn"
                              onClick={() => handleDelete('task', task)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderGrades = () => (
    <div className="grades-view">
      <div className="grades-header">
        <div className="gpa-display">
          <div className="gpa-card">
            <div className="gpa-value">{gpa}</div>
            <div className="gpa-label">Current GPA</div>
          </div>
        </div>
        <button className="add-grade-btn" onClick={handleAddGrade}>
          + Add Grade
        </button>
      </div>

      {grades.length === 0 ? (
        <div className="no-grades">
          <div className="no-grades-icon">📊</div>
          <h3>No Grades Recorded</h3>
          <p>Start tracking your academic performance!</p>
          <button className="start-grades-btn" onClick={handleAddGrade}>
            Add Your First Grade
          </button>
        </div>
      ) : (
        <div className="grades-content">
          <div className="grades-by-subject">
            {subjects.map(subject => {
              const subjectGrades = grades.filter(grade => grade.subject === subject.name)
              if (subjectGrades.length === 0) return null
              
              const subjectGPA = getSubjectGPA(subject.name)
              
              return (
                <div key={subject.id} className="subject-grades-section">
                  <div className="subject-grades-header">
                    <div 
                      className="subject-color"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div className="subject-info">
                      <h4>{subject.name}</h4>
                      <div className="subject-gpa">GPA: {subjectGPA}</div>
                    </div>
                  </div>
                  
                  <div className="grades-list">
                    {subjectGrades.map(grade => (
                      <div key={grade.id} className="grade-card">
                        <div className="grade-info">
                          <div className="grade-assignment">{grade.assignment}</div>
                          <div className="grade-meta">
                            <span className="grade-type">{gradeTypes[grade.type]}</span>
                            <span className="grade-date">
                              {new Date(grade.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grade-score">
                          <div className="grade-letter">{grade.grade}</div>
                          {grade.points && grade.maxPoints && (
                            <div className="grade-points">
                              {grade.points}/{grade.maxPoints}
                            </div>
                          )}
                        </div>
                        
                        <div className="grade-actions">
                          <button 
                            className="edit-grade-btn"
                            onClick={() => handleEditGrade(grade)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-grade-btn"
                            onClick={() => handleDelete('grade', grade)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  const renderSchedule = () => (
    <div className="schedule-view">
      <div className="schedule-header">
        <h3>Study Schedule</h3>
        <button className="add-schedule-btn" onClick={handleAddSchedule}>
          + Add Study Session
        </button>
      </div>

      {schedule.length === 0 ? (
        <div className="no-schedule">
          <div className="no-schedule-icon">⏰</div>
          <h3>No Study Schedule</h3>
          <p>Create a study schedule to stay organized!</p>
          <button className="start-schedule-btn" onClick={handleAddSchedule}>
            Create Your Schedule
          </button>
        </div>
      ) : (
        <div className="schedule-content">
          <div className="weekly-schedule">
            {Object.entries(daysOfWeek).map(([dayKey, dayName]) => {
              const daySessions = schedule.filter(session => session.dayOfWeek === dayKey)
              
              return (
                <div key={dayKey} className="day-schedule">
                  <div className="day-header">
                    <h4>{dayName}</h4>
                    <span className="session-count">({daySessions.length})</span>
                  </div>
                  
                  {daySessions.length === 0 ? (
                    <div className="no-sessions">No study sessions</div>
                  ) : (
                    <div className="sessions-list">
                      {daySessions.map(session => (
                        <div key={session.id} className="session-card">
                          <div className="session-time">
                            {session.startTime}
                            {session.endTime && ` - ${session.endTime}`}
                          </div>
                          <div className="session-subject">{session.subject}</div>
                          {session.duration && (
                            <div className="session-duration">{session.duration} hours</div>
                          )}
                          {session.location && (
                            <div className="session-location">📍 {session.location}</div>
                          )}
                          <div className="session-actions">
                            <button 
                              className="edit-session-btn"
                              onClick={() => handleEditSchedule(session)}
                            >
                              ✏️
                            </button>
                            <button 
                              className="delete-session-btn"
                              onClick={() => handleDelete('schedule', session)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  const renderSubjects = () => (
    <div className="subjects-view">
      <div className="subjects-header">
        <h3>My Subjects</h3>
        <button className="add-subject-btn" onClick={handleAddSubject}>
          + Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="no-subjects">
          <div className="no-subjects-icon">📚</div>
          <h3>No Subjects Added</h3>
          <p>Add your school subjects to get started!</p>
          <button className="start-subjects-btn" onClick={handleAddSubject}>
            Add Your First Subject
          </button>
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map(subject => {
            const subjectGPA = getSubjectGPA(subject.name)
            const subjectTasks = tasks.filter(task => task.subject === subject.name && !task.completed).length
            const subjectGrades = grades.filter(grade => grade.subject === subject.name).length
            
            return (
              <div key={subject.id} className="subject-card">
                <div 
                  className="subject-color-header"
                  style={{ backgroundColor: subject.color }}
                />
                
                <div className="subject-content">
                  <div className="subject-name">{subject.name}</div>
                  {subject.teacher && (
                    <div className="subject-teacher">👨‍🏫 {subject.teacher}</div>
                  )}
                  {subject.room && (
                    <div className="subject-room">🏫 {subject.room}</div>
                  )}
                  
                  <div className="subject-stats">
                    <div className="subject-stat">
                      <span className="stat-value">{subjectGPA}</span>
                      <span className="stat-label">GPA</span>
                    </div>
                    <div className="subject-stat">
                      <span className="stat-value">{subjectTasks}</span>
                      <span className="stat-label">Pending</span>
                    </div>
                    <div className="subject-stat">
                      <span className="stat-value">{subjectGrades}</span>
                      <span className="stat-label">Grades</span>
                    </div>
                  </div>
                </div>
                
                <div className="subject-actions">
                  <button 
                    className="edit-subject-btn"
                    onClick={() => handleEditSubject(subject)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="delete-subject-btn"
                    onClick={() => handleDelete('subject', subject)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <Layout title="🎓 School Organizer" showBackButton={true} backTo="/features">
      <div className="school-content">
        <div className="school-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks ({tasks.filter(t => !t.completed).length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
            onClick={() => setActiveTab('grades')}
          >
            Grades
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
          <button 
            className={`tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            Subjects ({subjects.length})
          </button>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'grades' && renderGrades()}
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'subjects' && renderSubjects()}

        {/* Task Modal */}
        {showAddModal && modalType === 'task' && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Task' : 'Add School Task'}</h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="task-form">
                  <div className="form-group">
                    <label>Task Type</label>
                    <div className="type-selector">
                      {Object.entries(taskTypes).map(([key, type]) => (
                        <button
                          key={key}
                          type="button"
                          className={`type-btn ${taskForm.type === key ? 'active' : ''}`}
                          onClick={() => setTaskForm({ ...taskForm, type: key })}
                        >
                          {type.icon} {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="taskTitle">Title</label>
                    <input
                      type="text"
                      id="taskTitle"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="e.g., Math homework chapter 5"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="taskSubject">Subject</label>
                      <select
                        id="taskSubject"
                        value={taskForm.subject}
                        onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.name}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="taskPriority">Priority</label>
                      <select
                        id="taskPriority"
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      >
                        {Object.entries(priorities).map(([key, priority]) => (
                          <option key={key} value={key}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="taskDescription">Description (Optional)</label>
                    <textarea
                      id="taskDescription"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="Additional details about the task..."
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="taskDueDate">Due Date (Optional)</label>
                      <input
                        type="date"
                        id="taskDueDate"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="taskReminder">Reminder Time (Optional)</label>
                      <input
                        type="time"
                        id="taskReminder"
                        value={taskForm.reminderTime}
                        onChange={(e) => setTaskForm({ ...taskForm, reminderTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveTask}>
                  {editingItem ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subject Modal */}
        {showSubjectModal && (
          <div className="modal-overlay" onClick={() => setShowSubjectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Subject' : 'Add Subject'}</h3>
                <button className="modal-close" onClick={() => setShowSubjectModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="subject-form">
                  <div className="form-group">
                    <label htmlFor="subjectName">Subject Name</label>
                    <input
                      type="text"
                      id="subjectName"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      placeholder="e.g., Mathematics, English Literature"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="subjectTeacher">Teacher (Optional)</label>
                      <input
                        type="text"
                        id="subjectTeacher"
                        value={subjectForm.teacher}
                        onChange={(e) => setSubjectForm({ ...subjectForm, teacher: e.target.value })}
                        placeholder="Teacher's name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="subjectRoom">Room (Optional)</label>
                      <input
                        type="text"
                        id="subjectRoom"
                        value={subjectForm.room}
                        onChange={(e) => setSubjectForm({ ...subjectForm, room: e.target.value })}
                        placeholder="Room number"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="subjectCredits">Credits</label>
                      <input
                        type="number"
                        id="subjectCredits"
                        value={subjectForm.credits}
                        onChange={(e) => setSubjectForm({ ...subjectForm, credits: e.target.value })}
                        placeholder="3"
                        step="0.5"
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="subjectColor">Color</label>
                      <input
                        type="color"
                        id="subjectColor"
                        value={subjectForm.color}
                        onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowSubjectModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveSubject}>
                  {editingItem ? 'Update Subject' : 'Add Subject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grade Modal */}
        {showGradeModal && (
          <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Grade' : 'Add Grade'}</h3>
                <button className="modal-close" onClick={() => setShowGradeModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="grade-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="gradeSubject">Subject</label>
                      <select
                        id="gradeSubject"
                        value={gradeForm.subject}
                        onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.name}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="gradeType">Type</label>
                      <select
                        id="gradeType"
                        value={gradeForm.type}
                        onChange={(e) => setGradeForm({ ...gradeForm, type: e.target.value })}
                      >
                        {Object.entries(gradeTypes).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="gradeAssignment">Assignment Name</label>
                    <input
                      type="text"
                      id="gradeAssignment"
                      value={gradeForm.assignment}
                      onChange={(e) => setGradeForm({ ...gradeForm, assignment: e.target.value })}
                      placeholder="e.g., Midterm Exam, Chapter 5 Quiz"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="gradeGrade">Grade</label>
                      <select
                        id="gradeGrade"
                        value={gradeForm.grade}
                        onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                        required
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="B-">B-</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="C-">C-</option>
                        <option value="D+">D+</option>
                        <option value="D">D</option>
                        <option value="D-">D-</option>
                        <option value="F">F</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="gradeDate">Date</label>
                      <input
                        type="date"
                        id="gradeDate"
                        value={gradeForm.date}
                        onChange={(e) => setGradeForm({ ...gradeForm, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="gradePoints">Points Earned (Optional)</label>
                      <input
                        type="number"
                        id="gradePoints"
                        value={gradeForm.points}
                        onChange={(e) => setGradeForm({ ...gradeForm, points: e.target.value })}
                        placeholder="85"
                        step="0.1"
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="gradeMaxPoints">Max Points (Optional)</label>
                      <input
                        type="number"
                        id="gradeMaxPoints"
                        value={gradeForm.maxPoints}
                        onChange={(e) => setGradeForm({ ...gradeForm, maxPoints: e.target.value })}
                        placeholder="100"
                        step="0.1"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="gradeCredits">Credits</label>
                    <input
                      type="number"
                      id="gradeCredits"
                      value={gradeForm.credits}
                      onChange={(e) => setGradeForm({ ...gradeForm, credits: e.target.value })}
                      placeholder="3"
                      step="0.5"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowGradeModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveGrade}>
                  {editingItem ? 'Update Grade' : 'Add Grade'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Study Session' : 'Add Study Session'}</h3>
                <button className="modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="schedule-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="scheduleSubject">Subject</label>
                      <select
                        id="scheduleSubject"
                        value={scheduleForm.subject}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.name}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="scheduleDayOfWeek">Day of Week</label>
                      <select
                        id="scheduleDayOfWeek"
                        value={scheduleForm.dayOfWeek}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                      >
                        {Object.entries(daysOfWeek).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="scheduleStartTime">Start Time</label>
                      <input
                        type="time"
                        id="scheduleStartTime"
                        value={scheduleForm.startTime}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="scheduleEndTime">End Time (Optional)</label>
                      <input
                        type="time"
                        id="scheduleEndTime"
                        value={scheduleForm.endTime}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="scheduleDuration">Duration (Hours)</label>
                      <input
                        type="number"
                        id="scheduleDuration"
                        value={scheduleForm.duration}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                        placeholder="1.5"
                        step="0.5"
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="scheduleLocation">Location (Optional)</label>
                      <input
                        type="text"
                        id="scheduleLocation"
                        value={scheduleForm.location}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                        placeholder="Library, Room 101"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="scheduleNotes">Notes (Optional)</label>
                    <textarea
                      id="scheduleNotes"
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                      placeholder="Study goals, topics to cover..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveSchedule}>
                  {editingItem ? 'Update Session' : 'Add Session'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Confirm Delete</h3>
                <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <p>Are you sure you want to delete this {deleteItem?.type}? This action cannot be undone.</p>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
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