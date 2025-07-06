import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function FinanceApp() {
  const {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getBudgets,
    setBudget,
    getSavingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    getFinanceSettings,
    updateFinanceSettings
  } = useFeatures()

  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'transactions', 'budgets', 'goals'
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    title: '',
    category: 'food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
    recurringFrequency: 'monthly'
  })

  const [budgetForm, setBudgetForm] = useState({
    category: 'food',
    amount: '',
    period: 'monthly'
  })

  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    description: ''
  })

  const categories = {
    food: { label: 'Food & Dining', icon: '🍽️', color: '#ff6b6b' },
    transport: { label: 'Transportation', icon: '🚗', color: '#4ecdc4' },
    entertainment: { label: 'Entertainment', icon: '🎬', color: '#45b7d1' },
    shopping: { label: 'Shopping', icon: '🛍️', color: '#f9ca24' },
    bills: { label: 'Bills & Utilities', icon: '📄', color: '#f0932b' },
    health: { label: 'Healthcare', icon: '🏥', color: '#eb4d4b' },
    education: { label: 'Education', icon: '📚', color: '#6c5ce7' },
    travel: { label: 'Travel', icon: '✈️', color: '#a29bfe' },
    rent: { label: 'Rent/Mortgage', icon: '🏠', color: '#fd79a8' },
    salary: { label: 'Salary', icon: '💼', color: '#00b894' },
    freelance: { label: 'Freelance', icon: '💻', color: '#00cec9' },
    investment: { label: 'Investment', icon: '📈', color: '#fdcb6e' },
    gift: { label: 'Gift', icon: '🎁', color: '#e17055' },
    other: { label: 'Other', icon: '📦', color: '#636e72' }
  }

  const transactions = getTransactions()
  const budgets = getBudgets()
  const savingsGoals = getSavingsGoals()
  const settings = getFinanceSettings()

  const handleAddTransaction = () => {
    setTransactionForm({
      type: 'expense',
      title: '',
      category: 'food',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      isRecurring: false,
      recurringFrequency: 'monthly'
    })
    setEditingItem(null)
    setShowAddModal(true)
  }

  const handleEditTransaction = (transaction) => {
    setTransactionForm({
      type: transaction.type,
      title: transaction.title,
      category: transaction.category,
      amount: transaction.amount.toString(),
      date: transaction.date,
      notes: transaction.notes || '',
      isRecurring: transaction.isRecurring || false,
      recurringFrequency: transaction.recurringFrequency || 'monthly'
    })
    setEditingItem(transaction)
    setShowAddModal(true)
  }

  const handleSaveTransaction = () => {
    if (!transactionForm.title.trim() || !transactionForm.amount) {
      alert('Please fill in title and amount')
      return
    }

    const transactionData = {
      type: transactionForm.type,
      title: transactionForm.title.trim(),
      category: transactionForm.category,
      amount: parseFloat(transactionForm.amount),
      date: transactionForm.date,
      notes: transactionForm.notes.trim(),
      isRecurring: transactionForm.isRecurring,
      recurringFrequency: transactionForm.recurringFrequency
    }

    if (editingItem) {
      updateTransaction(editingItem.id, transactionData)
    } else {
      addTransaction(transactionData)
    }

    setShowAddModal(false)
    setEditingItem(null)
  }

  const handleDeleteTransaction = (transaction) => {
    setDeleteItem({ type: 'transaction', item: transaction })
    setShowDeleteModal(true)
  }

  const handleAddBudget = () => {
    setBudgetForm({
      category: 'food',
      amount: '',
      period: 'monthly'
    })
    setShowBudgetModal(true)
  }

  const handleSaveBudget = () => {
    if (!budgetForm.amount) {
      alert('Please enter budget amount')
      return
    }

    setBudget(budgetForm.category, {
      amount: parseFloat(budgetForm.amount),
      period: budgetForm.period
    })

    setShowBudgetModal(false)
  }

  const handleAddGoal = () => {
    setGoalForm({
      title: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      description: ''
    })
    setEditingItem(null)
    setShowGoalModal(true)
  }

  const handleEditGoal = (goal) => {
    setGoalForm({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
      description: goal.description || ''
    })
    setEditingItem(goal)
    setShowGoalModal(true)
  }

  const handleSaveGoal = () => {
    if (!goalForm.title.trim() || !goalForm.targetAmount) {
      alert('Please fill in title and target amount')
      return
    }

    const goalData = {
      title: goalForm.title.trim(),
      targetAmount: parseFloat(goalForm.targetAmount),
      currentAmount: parseFloat(goalForm.currentAmount) || 0,
      targetDate: goalForm.targetDate,
      description: goalForm.description.trim()
    }

    if (editingItem) {
      updateSavingsGoal(editingItem.id, goalData)
    } else {
      addSavingsGoal(goalData)
    }

    setShowGoalModal(false)
    setEditingItem(null)
  }

  const confirmDelete = () => {
    if (deleteItem) {
      if (deleteItem.type === 'transaction') {
        deleteTransaction(deleteItem.item.id)
      } else if (deleteItem.type === 'goal') {
        deleteSavingsGoal(deleteItem.item.id)
      }
      setShowDeleteModal(false)
      setDeleteItem(null)
    }
  }

  const getMonthlyData = (month) => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(month))
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    
    const categoryTotals = {}
    monthTransactions.forEach(t => {
      if (t.type === 'expense') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      }
    })

    return { income, expenses, net: income - expenses, categoryTotals, transactions: monthTransactions }
  }

  const monthlyData = getMonthlyData(selectedMonth)

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Title', 'Category', 'Amount', 'Notes']
    const csvData = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        t.type,
        `"${t.title}"`,
        t.category,
        t.amount,
        `"${t.notes || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderOverview = () => (
    <div className="finance-overview">
      <div className="month-selector">
        <label htmlFor="monthSelect">Viewing Month:</label>
        <input
          type="month"
          id="monthSelect"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-input"
        />
      </div>

      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <div className="summary-label">Income</div>
            <div className="summary-amount">${monthlyData.income.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="summary-card expense">
          <div className="summary-icon">💸</div>
          <div className="summary-content">
            <div className="summary-label">Expenses</div>
            <div className="summary-amount">${monthlyData.expenses.toFixed(2)}</div>
          </div>
        </div>
        
        <div className={`summary-card net ${monthlyData.net >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-icon">{monthlyData.net >= 0 ? '📈' : '📉'}</div>
          <div className="summary-content">
            <div className="summary-label">Net</div>
            <div className="summary-amount">${monthlyData.net.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {Object.keys(monthlyData.categoryTotals).length > 0 && (
        <div className="category-breakdown">
          <h3>Expenses by Category</h3>
          <div className="category-chart">
            {Object.entries(monthlyData.categoryTotals)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / monthlyData.expenses) * 100
                return (
                  <div key={category} className="category-item">
                    <div className="category-info">
                      <span className="category-icon">{categories[category]?.icon}</span>
                      <span className="category-name">{categories[category]?.label}</span>
                      <span className="category-amount">${amount.toFixed(2)}</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-fill" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: categories[category]?.color 
                        }}
                      />
                    </div>
                    <div className="category-percentage">{percentage.toFixed(1)}%</div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      <div className="quick-actions">
        <button className="quick-action-btn income" onClick={() => {
          setTransactionForm({ ...transactionForm, type: 'income' })
          handleAddTransaction()
        }}>
          + Add Income
        </button>
        <button className="quick-action-btn expense" onClick={() => {
          setTransactionForm({ ...transactionForm, type: 'expense' })
          handleAddTransaction()
        }}>
          + Add Expense
        </button>
        <button className="quick-action-btn export" onClick={exportToCSV}>
          📊 Export CSV
        </button>
      </div>
    </div>
  )

  const renderTransactions = () => (
    <div className="transactions-view">
      <div className="transactions-header">
        <h3>Transaction History</h3>
        <button className="add-transaction-btn" onClick={handleAddTransaction}>
          + Add Transaction
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="no-transactions">
          <div className="no-transactions-icon">💰</div>
          <h3>No Transactions Yet</h3>
          <p>Start tracking your income and expenses!</p>
          <button className="start-tracking-btn" onClick={handleAddTransaction}>
            Add Your First Transaction
          </button>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map(transaction => (
            <div key={transaction.id} className={`transaction-card ${transaction.type}`}>
              <div className="transaction-icon">
                {categories[transaction.category]?.icon}
              </div>
              <div className="transaction-details">
                <div className="transaction-title">{transaction.title}</div>
                <div className="transaction-meta">
                  <span className="transaction-category">
                    {categories[transaction.category]?.label}
                  </span>
                  <span className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </div>
                {transaction.notes && (
                  <div className="transaction-notes">{transaction.notes}</div>
                )}
              </div>
              <div className="transaction-amount">
                <span className={`amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
                <div className="transaction-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditTransaction(transaction)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteTransaction(transaction)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderBudgets = () => (
    <div className="budgets-view">
      <div className="budgets-header">
        <h3>Budget Management</h3>
        <button className="add-budget-btn" onClick={handleAddBudget}>
          + Set Budget
        </button>
      </div>

      <div className="budgets-grid">
        {Object.entries(categories).filter(([key]) => key !== 'salary' && key !== 'freelance' && key !== 'investment' && key !== 'gift').map(([categoryKey, category]) => {
          const budget = budgets[categoryKey]
          const spent = monthlyData.categoryTotals[categoryKey] || 0
          const percentage = budget ? (spent / budget.amount) * 100 : 0
          
          return (
            <div key={categoryKey} className="budget-card">
              <div className="budget-header">
                <div className="budget-category">
                  <span className="budget-icon">{category.icon}</span>
                  <span className="budget-name">{category.label}</span>
                </div>
                {budget && (
                  <div className="budget-limit">${budget.amount.toFixed(2)}</div>
                )}
              </div>
              
              {budget ? (
                <>
                  <div className="budget-progress">
                    <div className="budget-bar">
                      <div 
                        className={`budget-fill ${percentage > 100 ? 'over-budget' : ''}`}
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: percentage > 100 ? '#e74c3c' : category.color
                        }}
                      />
                    </div>
                    <div className="budget-text">
                      <span className="budget-spent">${spent.toFixed(2)} spent</span>
                      <span className={`budget-remaining ${percentage > 100 ? 'over' : ''}`}>
                        {percentage > 100 
                          ? `$${(spent - budget.amount).toFixed(2)} over`
                          : `$${(budget.amount - spent).toFixed(2)} left`
                        }
                      </span>
                    </div>
                  </div>
                  <div className="budget-percentage">
                    {percentage.toFixed(1)}% used
                  </div>
                </>
              ) : (
                <div className="no-budget">
                  <p>No budget set</p>
                  <button 
                    className="set-budget-btn"
                    onClick={() => {
                      setBudgetForm({ ...budgetForm, category: categoryKey })
                      setShowBudgetModal(true)
                    }}
                  >
                    Set Budget
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderGoals = () => (
    <div className="goals-view">
      <div className="goals-header">
        <h3>Savings Goals</h3>
        <button className="add-goal-btn" onClick={handleAddGoal}>
          + Add Goal
        </button>
      </div>

      {savingsGoals.length === 0 ? (
        <div className="no-goals">
          <div className="no-goals-icon">🎯</div>
          <h3>No Savings Goals Yet</h3>
          <p>Set financial goals to track your progress!</p>
          <button className="start-goals-btn" onClick={handleAddGoal}>
            Add Your First Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {savingsGoals.map(goal => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100
            const remaining = goal.targetAmount - goal.currentAmount
            
            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <div className="goal-title">{goal.title}</div>
                  <div className="goal-actions">
                    <button 
                      className="edit-goal-btn"
                      onClick={() => handleEditGoal(goal)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-goal-btn"
                      onClick={() => {
                        setDeleteItem({ type: 'goal', item: goal })
                        setShowDeleteModal(true)
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {goal.description && (
                  <div className="goal-description">{goal.description}</div>
                )}
                
                <div className="goal-progress">
                  <div className="goal-amounts">
                    <span className="current-amount">${goal.currentAmount.toFixed(2)}</span>
                    <span className="target-amount">of ${goal.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="goal-bar">
                    <div 
                      className="goal-fill"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="goal-stats">
                    <span className="goal-percentage">{percentage.toFixed(1)}% complete</span>
                    <span className="goal-remaining">${remaining.toFixed(2)} to go</span>
                  </div>
                </div>
                
                {goal.targetDate && (
                  <div className="goal-deadline">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <Layout title="💰 Finance Center" showBackButton={true} backTo="/features">
      <div className="finance-content">
        <div className="finance-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions ({transactions.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgets')}
          >
            Budgets
          </button>
          <button 
            className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            Goals ({savingsGoals.length})
          </button>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'budgets' && renderBudgets()}
        {activeTab === 'goals' && renderGoals()}

        {/* Add/Edit Transaction Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Transaction' : 'Add Transaction'}</h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="transaction-form">
                  <div className="form-group">
                    <label>Transaction Type</label>
                    <div className="type-selector">
                      <button
                        type="button"
                        className={`type-btn ${transactionForm.type === 'income' ? 'active' : ''}`}
                        onClick={() => setTransactionForm({ ...transactionForm, type: 'income' })}
                      >
                        💰 Income
                      </button>
                      <button
                        type="button"
                        className={`type-btn ${transactionForm.type === 'expense' ? 'active' : ''}`}
                        onClick={() => setTransactionForm({ ...transactionForm, type: 'expense' })}
                      >
                        💸 Expense
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="transactionTitle">Title</label>
                    <input
                      type="text"
                      id="transactionTitle"
                      value={transactionForm.title}
                      onChange={(e) => setTransactionForm({ ...transactionForm, title: e.target.value })}
                      placeholder="e.g., Grocery shopping, Salary"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="transactionCategory">Category</label>
                      <select
                        id="transactionCategory"
                        value={transactionForm.category}
                        onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                      >
                        {Object.entries(categories).map(([key, cat]) => (
                          <option key={key} value={key}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="transactionAmount">Amount ($)</label>
                      <input
                        type="number"
                        id="transactionAmount"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="transactionDate">Date</label>
                    <input
                      type="date"
                      id="transactionDate"
                      value={transactionForm.date}
                      onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="transactionNotes">Notes (Optional)</label>
                    <textarea
                      id="transactionNotes"
                      value={transactionForm.notes}
                      onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                      placeholder="Additional details..."
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={transactionForm.isRecurring}
                        onChange={(e) => setTransactionForm({ ...transactionForm, isRecurring: e.target.checked })}
                      />
                      <span>Recurring transaction</span>
                    </label>
                    {transactionForm.isRecurring && (
                      <select
                        value={transactionForm.recurringFrequency}
                        onChange={(e) => setTransactionForm({ ...transactionForm, recurringFrequency: e.target.value })}
                        className="frequency-select"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveTransaction}
                >
                  {editingItem ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Budget Modal */}
        {showBudgetModal && (
          <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Set Budget</h3>
                <button className="modal-close" onClick={() => setShowBudgetModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="budget-form">
                  <div className="form-group">
                    <label htmlFor="budgetCategory">Category</label>
                    <select
                      id="budgetCategory"
                      value={budgetForm.category}
                      onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                    >
                      {Object.entries(categories).filter(([key]) => key !== 'salary' && key !== 'freelance' && key !== 'investment' && key !== 'gift').map(([key, cat]) => (
                        <option key={key} value={key}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="budgetAmount">Budget Amount ($)</label>
                    <input
                      type="number"
                      id="budgetAmount"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="budgetPeriod">Period</label>
                    <select
                      id="budgetPeriod"
                      value={budgetForm.period}
                      onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value })}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowBudgetModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveBudget}>
                  Set Budget
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Savings Goal Modal */}
        {showGoalModal && (
          <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Savings Goal' : 'Add Savings Goal'}</h3>
                <button className="modal-close" onClick={() => setShowGoalModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="goal-form">
                  <div className="form-group">
                    <label htmlFor="goalTitle">Goal Title</label>
                    <input
                      type="text"
                      id="goalTitle"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                      placeholder="e.g., Emergency Fund, Vacation"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="goalTarget">Target Amount ($)</label>
                      <input
                        type="number"
                        id="goalTarget"
                        value={goalForm.targetAmount}
                        onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="goalCurrent">Current Amount ($)</label>
                      <input
                        type="number"
                        id="goalCurrent"
                        value={goalForm.currentAmount}
                        onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="goalDate">Target Date (Optional)</label>
                    <input
                      type="date"
                      id="goalDate"
                      value={goalForm.targetDate}
                      onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="goalDescription">Description (Optional)</label>
                    <textarea
                      id="goalDescription"
                      value={goalForm.description}
                      onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                      placeholder="What is this goal for?"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowGoalModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveGoal}>
                  {editingItem ? 'Update Goal' : 'Add Goal'}
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