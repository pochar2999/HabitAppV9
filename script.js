import authManager from './src/auth/auth-manager.js';

// Global app data - will be managed by AuthManager
window.appData = {
  user: 'User',
  daysLogged: 0,
  activeHabits: [],
  habits: {},
  dailyNotes: {}
};

// Application state
let appInitialized = false;
let currentScreen = 'home';
let currentHabit = null;
let habitType = null;

console.log('Initializing HabitFlow app...');

// Wait for auth and user data to be loaded
function initializeApp() {
  if (appInitialized) return;

  console.log('Loading data...');

  // Check if auth is initialized and user data is loaded
  if (authManager.isAuthInitialized() && authManager.isUserDataLoaded()) {
    const user = authManager.getCurrentUser();

    if (user && user.emailVerified) {
      console.log('User authenticated, data loaded by authManager');
      // Data is already loaded by AuthManager, just update the UI
      updateHomeScreen();
      console.log('HabitFlow app initialized successfully');
      appInitialized = true;
    } else {
      console.log('User not authenticated, redirecting to login');
      // Redirect to login if not authenticated
      window.location.href = 'login.html';
    }
  }
}

// Listen for auth state changes
authManager.onAuthStateChange((user) => {
  console.log('Auth state changed:', user ? user.email : 'none');

  if (!user || !user.emailVerified) {
    // User logged out or not verified - redirect to login
    if (window.location.pathname !== '/login.html' && 
        window.location.pathname !== '/signup.html' && 
        window.location.pathname !== '/forgot.html' &&
        window.location.pathname !== '/verify.html') {
      window.location.href = 'login.html';
    }
  }
});

// Listen for user data load events
authManager.onUserDataLoad((user) => {
  console.log('User data loaded:', user ? user.email : 'none');

  if (user && user.emailVerified) {
    // Initialize the app now that user data is loaded
    initializeApp();
  } else {
    // Reset app state for logged out user
    appInitialized = false;
    window.appData = {
      user: 'User',
      daysLogged: 0,
      activeHabits: [],
      habits: {},
      dailyNotes: {}
    };
  }
});

// Try to initialize immediately if already ready
initializeApp();

function updateHomeScreen() {
  console.log('Updating home screen with data:', window.appData);

  // Update stats
  updateStats();

  // Update habits display
  updateHabitsDisplay();

  // Update daily notes
  updateDailyNotes();

  // Update greeting if element exists
  const greeting = document.getElementById("greeting");
  if (greeting && !greeting.textContent.includes('Welcome back')) {
    const user = authManager.getCurrentUser();
    if (user) {
      const displayName = user.displayName || user.email.split('@')[0];
      greeting.textContent = `Welcome back, ${displayName}!`;
    }
  }
}

function updateStats() {
  // Update days logged
  const daysLoggedElement = document.getElementById("days-logged");
  if (daysLoggedElement) {
    daysLoggedElement.textContent = window.appData.daysLogged || 0;
  }

  // Update active habits count
  const activeHabitsElement = document.getElementById("active-habits-count");
  if (activeHabitsElement) {
    activeHabitsElement.textContent = window.appData.activeHabits?.length || 0;
  }

  // Update completion rate
  const completionRateElement = document.getElementById("completion-rate");
  if (completionRateElement) {
    const rate = calculateCompletionRate();
    completionRateElement.textContent = `${rate}%`;
  }
}

function calculateCompletionRate() {
  const habits = window.appData.habits || {};
  const activeHabits = window.appData.activeHabits || [];

  if (activeHabits.length === 0) return 0;

  let totalPossible = 0;
  let totalCompleted = 0;

  activeHabits.forEach(habitId => {
    const habit = habits[habitId];
    if (habit && habit.streak !== undefined) {
      totalPossible++;
      if (habit.completedToday) {
        totalCompleted++;
      }
    }
  });

  return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
}

function updateHabitsDisplay() {
  const habitsContainer = document.getElementById("habits-container");
  if (!habitsContainer) return;

  const activeHabits = window.appData.activeHabits || [];
  const habits = window.appData.habits || {};

  if (activeHabits.length === 0) {
    habitsContainer.innerHTML = '<p class="no-habits">No habits yet. Add your first habit to get started!</p>';
    return;
  }

  habitsContainer.innerHTML = '';

  activeHabits.forEach(habitId => {
    const habit = habits[habitId];
    if (!habit) return;

    const habitElement = document.createElement('div');
    habitElement.className = `habit-item ${habit.completedToday ? 'completed' : ''}`;
    habitElement.innerHTML = `
      <div class="habit-content">
        <div class="habit-info">
          <h3 class="habit-name">${habit.name}</h3>
          <p class="habit-description">${habit.description || ''}</p>
          <div class="habit-stats">
            <span class="streak">🔥 ${habit.streak || 0} day streak</span>
            <span class="category">${habit.category || 'General'}</span>
          </div>
        </div>
        <div class="habit-actions">
          <button class="complete-btn ${habit.completedToday ? 'completed' : ''}" 
                  onclick="toggleHabit('${habitId}')" 
                  ${habit.completedToday ? 'disabled' : ''}>
            ${habit.completedToday ? '✓ Done' : 'Mark Complete'}
          </button>
          <button class="delete-btn" onclick="deleteHabit('${habitId}')">
            🗑️
          </button>
        </div>
      </div>
    `;

    habitsContainer.appendChild(habitElement);
  });
}

function updateDailyNotes() {
  const notesTextarea = document.getElementById("daily-notes");
  if (!notesTextarea) return;

  const today = new Date().toISOString().split('T')[0];
  const todayNotes = window.appData.dailyNotes?.[today] || '';

  notesTextarea.value = todayNotes;
}

// Habit management functions
window.toggleHabit = function(habitId) {
  const habit = window.appData.habits[habitId];
  if (!habit || habit.completedToday) return;

  const today = new Date().toISOString().split('T')[0];

  // Mark as completed today
  habit.completedToday = true;
  habit.lastCompleted = today;
  habit.streak = (habit.streak || 0) + 1;

  // Increment days logged if this is the first habit completed today
  const habitsCompletedToday = window.appData.activeHabits.filter(id => 
    window.appData.habits[id]?.completedToday
  ).length;

  if (habitsCompletedToday === 1) {
    window.appData.daysLogged = (window.appData.daysLogged || 0) + 1;
  }

  saveData();
  updateHabitsDisplay();
  updateStats();
};

window.deleteHabit = function(habitId) {
  if (!confirm('Are you sure you want to delete this habit?')) return;

  // Remove from active habits
  window.appData.activeHabits = window.appData.activeHabits.filter(id => id !== habitId);

  // Remove from habits object
  delete window.appData.habits[habitId];

  saveData();
  updateHabitsDisplay();
  updateStats();
};

window.addHabit = function() {
  const name = document.getElementById("habit-name")?.value?.trim();
  const description = document.getElementById("habit-description")?.value?.trim();
  const category = document.getElementById("habit-category")?.value || 'General';

  if (!name) {
    alert('Please enter a habit name');
    return;
  }

  const habitId = 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  const newHabit = {
    id: habitId,
    name: name,
    description: description,
    category: category,
    streak: 0,
    completedToday: false,
    createdAt: new Date().toISOString(),
    lastCompleted: null
  };

  // Add to habits object
  window.appData.habits[habitId] = newHabit;

  // Add to active habits
  if (!window.appData.activeHabits.includes(habitId)) {
    window.appData.activeHabits.push(habitId);
  }

  // Clear form
  document.getElementById("habit-name").value = '';
  document.getElementById("habit-description").value = '';
  document.getElementById("habit-category").value = 'General';

  saveData();
  updateHabitsDisplay();
  updateStats();

  // Close modal if it exists
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// Daily notes functionality
window.saveDailyNotes = function() {
  const notesTextarea = document.getElementById("daily-notes");
  if (!notesTextarea) return;

  const today = new Date().toISOString().split('T')[0];
  const notes = notesTextarea.value;

  if (!window.appData.dailyNotes) {
    window.appData.dailyNotes = {};
  }

  window.appData.dailyNotes[today] = notes;
  saveData();
};

// Auto-save notes on input
document.addEventListener('DOMContentLoaded', () => {
  const notesTextarea = document.getElementById("daily-notes");
  if (notesTextarea) {
    notesTextarea.addEventListener('input', window.saveDailyNotes);
  }
});

// Reset daily completion status
function resetDailyCompletion() {
  const today = new Date().toISOString().split('T')[0];
  let hasChanges = false;

  Object.keys(window.appData.habits || {}).forEach(habitId => {
    const habit = window.appData.habits[habitId];
    if (habit && habit.lastCompleted !== today && habit.completedToday) {
      habit.completedToday = false;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    saveData();
    updateHabitsDisplay();
    updateStats();
  }
}

// Check and reset daily completion on load
resetDailyCompletion();

// Save data function that uses AuthManager
function saveData() {
  console.log('Saving data...', window.appData);

  // Save through AuthManager which handles Firebase
  authManager.saveUserData();
}

// Auto-save every 30 seconds
setInterval(saveData, 30000);

// Save on page unload
window.addEventListener('beforeunload', saveData);

// Navigation Functions - Define early for immediate availability
function navigateTo(screen) {
    // Hide current screen
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Show target screen
    const targetScreen = document.getElementById(screen + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Update navigation state
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const targetNavBtn = document.querySelector(`[data-tab="${screen}"]`);
    if (targetNavBtn) {
        targetNavBtn.classList.add('active');
    }
    
    currentScreen = screen;
    
    // Update screen content
    updateScreenContent(screen);
}

function goBack() {
    if (currentScreen === 'strategy') {
        navigateTo(habitType === 'build' ? 'build-habits' : 'break-habits');
    } else {
        navigateTo('home');
    }
}

function updateScreenContent(screen) {
    switch (screen) {
        case 'home':
            updateHomeScreen();
            break;
        case 'habits':
            updateHabitsScreen();
            break;
        case 'progress':
            updateProgressScreen();
            break;
    }
}

// Search Functions
function searchHabits(type) {
    const searchInput = document.getElementById(`${type}-search`);
    const habitsList = document.getElementById(`${type}-habits-list`);
    
    if (!searchInput || !habitsList) return;
    
    const query = searchInput.value.toLowerCase();
    
    const cards = habitsList.querySelectorAll('.habit-card');
    cards.forEach(card => {
        const habitName = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const habitDescription = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (habitName.includes(query) || habitDescription.includes(query)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Habit Selection Functions
function selectHabit(habitId, type) {
    currentHabit = habitId;
    habitType = type;
    
    const habit = habitsData[habitId];
    if (!habit) return;
    
    // Update strategy screen
    const strategyTitle = document.getElementById('strategy-title');
    const habitDescription = document.getElementById('habit-description');
    
    if (strategyTitle) strategyTitle.textContent = habit.name + ' Strategy';
    if (habitDescription) habitDescription.textContent = habit.description;
    
    // Update methods
    const methodsList = document.getElementById('methods-list');
    if (methodsList) {
        methodsList.innerHTML = '';
        
        habit.methods.forEach(method => {
            const methodCard = document.createElement('div');
            methodCard.className = 'method-card';
            methodCard.innerHTML = `
                <div class="method-title">${method.title}</div>
                <div class="method-description">${method.description}</div>
            `;
            methodsList.appendChild(methodCard);
        });
    }
    
    // Show quote for break habits
    const quoteSection = document.getElementById('quote-section');
    const motivationalQuote = document.getElementById('motivational-quote');
    
    if (habit.quote && quoteSection && motivationalQuote) {
        motivationalQuote.textContent = habit.quote;
        quoteSection.style.display = 'block';
    } else if (quoteSection) {
        quoteSection.style.display = 'none';
    }
    
    // Update start button text
    const startBtn = document.getElementById('start-habit-btn');
    if (startBtn) {
        startBtn.textContent = type === 'build' ? 'Start Habit Plan' : 'Start Breaking Plan';
    }
    
    navigateTo('strategy');
}

function startHabit() {
    if (!currentHabit) return;
    
    const today = new Date().toDateString();
    
    // Initialize habit data
    if (!window.appData.habits[currentHabit]) {
        window.appData.habits[currentHabit] = {
            startDate: today,
            streak: 0,
            bestStreak: 0,
            completedDays: [],
            totalDays: 0,
            currentMethod: 0,
            active: true
        };
        
        // Add to active habits if not already there
        if (!window.appData.activeHabits.includes(currentHabit)) {
            window.appData.activeHabits.push(currentHabit);
        }
    } else {
        // Reactivate habit if it was inactive
        window.appData.habits[currentHabit].active = true;
        if (!window.appData.activeHabits.includes(currentHabit)) {
            window.appData.activeHabits.push(currentHabit);
        }
    }
    
    saveData();
    navigateTo('habits');
}

// Make functions globally available immediately
window.navigateTo = navigateTo;
window.goBack = goBack;
window.searchHabits = searchHabits;
window.selectHabit = selectHabit;
window.startHabit = startHabit;

// Habit Data with images
const habitsData = {
    'drink-water': {
        name: 'Drink More Water',
        type: 'build',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=80&h=80&fit=crop&crop=center',
        description: 'Staying hydrated is crucial for your physical and mental health. Proper hydration boosts energy, improves brain function, and helps maintain healthy skin. Most people don\'t drink enough water daily, making this a simple but powerful habit to develop.',
        methods: [
            {
                title: 'Habit Stacking',
                description: 'After brushing your teeth in the morning, drink 1 full glass of water immediately.'
            },
            {
                title: 'Visual Cue Placement',
                description: 'Keep a water bottle visible on your desk or workspace as a constant reminder.'
            },
            {
                title: 'Tracking Trick',
                description: 'Set 3 phone alarms throughout the day as water reminders.'
            }
        ]
    },
    'wake-early': {
        name: 'Wake Up Early',
        type: 'build',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop&crop=center',
        description: 'Early risers often report higher productivity, better mental health, and more time for personal activities. Waking up early gives you a head start on the day and creates a sense of accomplishment before most people are even awake.',
        methods: [
            {
                title: 'Environment Setup',
                description: 'Place your phone/alarm clock across the room so you have to get up to turn it off.'
            },
            {
                title: 'Identity Shift',
                description: 'Visualize yourself as an early riser and the benefits you\'ll gain from morning time.'
            },
            {
                title: 'Cue Anchoring',
                description: 'Lay out your clothes the night before as a signal to go to bed early.'
            }
        ]
    },
    'meditation': {
        name: 'Practice Meditation',
        type: 'build',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=80&h=80&fit=crop&crop=center',
        description: 'Meditation reduces stress, improves focus, and enhances emotional well-being. Even just a few minutes of daily meditation can significantly impact your mental clarity and overall happiness.',
        methods: [
            {
                title: 'Tiny Habits',
                description: 'Start with just 1 minute of silence and deep breathing right after waking up.'
            },
            {
                title: 'Habit Buddy',
                description: 'Invite a friend to meditate with you and share daily check-ins for accountability.'
            },
            {
                title: 'Reward Loop',
                description: 'After meditating, write down one thing you\'re grateful for as a positive reinforcement.'
            }
        ]
    },
    'procrastination': {
        name: 'Stop Procrastinating',
        type: 'break',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=80&h=80&fit=crop&crop=center',
        description: 'Procrastination often stems from fear of failure, perfectionism, or feeling overwhelmed. It creates a cycle of stress and decreased productivity that affects both work and personal life.',
        methods: [
            {
                title: '5-Minute Rule',
                description: 'Commit to working on a task for just 5 minutes. Often, starting is the hardest part.'
            },
            {
                title: 'Delay Distraction',
                description: 'Use app blockers or physically move your phone to another room during work time.'
            },
            {
                title: 'Visualize Outcome',
                description: 'Picture how accomplished and relieved you\'ll feel after completing the task.'
            }
        ],
        quote: 'The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb'
    },
    'phone-use': {
        name: 'Quit Excessive Phone Use',
        type: 'break',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=80&h=80&fit=crop&crop=center',
        description: 'Excessive phone use can lead to decreased productivity, poor sleep, and reduced face-to-face social interactions. Breaking this habit can improve your focus, relationships, and overall well-being.',
        methods: [
            {
                title: 'Move Icons',
                description: 'Hide distracting apps in folders or remove them from your home screen entirely.'
            },
            {
                title: 'Scheduled Lockouts',
                description: 'Create phone-free zones and times, like no phone from 10pm to 7am.'
            },
            {
                title: 'Habit Swap',
                description: 'Replace phone checking with reading a book, listening to music, or taking a short walk.'
            }
        ],
        quote: 'The most precious thing you have is your attention. Guard it like your life depends on it. - Naval Ravikant'
    }
};

// Functions moved above for immediate availability

// Habits Management Screen Functions
function updateHabitsScreen() {
    const noHabitsMessage = document.getElementById('no-habits-message');
    const activeHabitsList = document.getElementById('active-habits-list');
    
    if (!noHabitsMessage || !activeHabitsList) return;
    
    if (!window.appData.activeHabits || window.appData.activeHabits.length === 0) {
        noHabitsMessage.style.display = 'block';
        activeHabitsList.innerHTML = '';
        return;
    }
    
    noHabitsMessage.style.display = 'none';
    activeHabitsList.innerHTML = '';
    
    window.appData.activeHabits.forEach(habitId => {
        const habit = habitsData[habitId];
        const habitData = window.appData.habits[habitId];
        
        if (!habit || !habitData || !habitData.active) return;
        
        const today = new Date().toDateString();
        const completedToday = habitData.completedDays.includes(today);
        
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        habitItem.innerHTML = `
            <div class="habit-header">
                <img src="${habit.image}" alt="${habit.name}" class="habit-item-image">
                <div>
                    <div class="habit-title">${habit.name}</div>
                    <div class="habit-streak">${habitData.streak} day streak</div>
                </div>
            </div>
            <div class="habit-actions">
                ${habit.type === 'build' ? 
                    `<button class="action-btn complete ${completedToday ? 'completed' : ''}" 
                        onclick="markHabitComplete('${habitId}')" 
                        ${completedToday ? 'disabled' : ''}>
                        ${completedToday ? 'Completed Today!' : 'Mark Complete'}
                    </button>` :
                    `<button class="action-btn resist ${completedToday ? 'resisted' : ''}" 
                        onclick="markHabitComplete('${habitId}')" 
                        ${completedToday ? 'disabled' : ''}>
                        ${completedToday ? 'Resisted Today!' : 'Mark Resisted'}
                    </button>`
                }
                ${completedToday ? 
                    `<button class="undo-btn" onclick="undoHabitComplete('${habitId}')">Undo</button>` : 
                    ''
                }
            </div>
        `;
        
        activeHabitsList.appendChild(habitItem);
    });
}

function markHabitComplete(habitId) {
    const today = new Date().toDateString();
    const habitData = window.appData.habits[habitId];
    
    if (!habitData || habitData.completedDays.includes(today)) {
        return;
    }
    
    // Mark as completed
    habitData.completedDays.push(today);
    habitData.streak += 1;
    habitData.totalDays += 1;
    
    if (habitData.streak > habitData.bestStreak) {
        habitData.bestStreak = habitData.streak;
    }
    
    // Increment days logged
    window.appData.daysLogged += 1;
    
    saveData();
    updateHabitsScreen();
    updateHomeScreen();
    showSuccessMessage();
}

function undoHabitComplete(habitId) {
    const today = new Date().toDateString();
    const habitData = window.appData.habits[habitId];
    
    if (!habitData || !habitData.completedDays.includes(today)) {
        return;
    }
    
    // Remove today from completed days
    habitData.completedDays = habitData.completedDays.filter(date => date !== today);
    habitData.streak = Math.max(0, habitData.streak - 1);
    habitData.totalDays = Math.max(0, habitData.totalDays - 1);
    
    // Decrement days logged
    window.appData.daysLogged = Math.max(0, window.appData.daysLogged - 1);
    
    saveData();
    updateHabitsScreen();
    updateHomeScreen();
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #48bb78, #38a169);
        color: white;
        padding: 20px 30px;
        border-radius: 20px;
        font-size: 18px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 8px 32px rgba(72, 187, 120, 0.4);
        animation: fadeIn 0.3s ease-in;
    `;
    message.textContent = 'Great job! Keep it up! 🎉';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

// Progress Screen Functions
function updateProgressScreen() {
    const noProgressMessage = document.getElementById('no-progress-message');
    const progressHabitsList = document.getElementById('progress-habits-list');
    
    if (!noProgressMessage || !progressHabitsList) return;
    
    if (!window.appData.activeHabits || window.appData.activeHabits.length === 0) {
        noProgressMessage.style.display = 'block';
        progressHabitsList.innerHTML = '';
        return;
    }
    
    noProgressMessage.style.display = 'none';
    progressHabitsList.innerHTML = '';
    
    window.appData.activeHabits.forEach(habitId => {
        const habit = habitsData[habitId];
        const habitData = window.appData.habits[habitId];
        
        if (!habit || !habitData || !habitData.active) return;
        
        const completionRate = habitData.totalDays > 0 ? 
            Math.round((habitData.completedDays.length / habitData.totalDays) * 100) : 0;
        
        const progressCard = document.createElement('div');
        progressCard.className = 'progress-habit-card';
        progressCard.innerHTML = `
            <div class="progress-habit-header">
                <img src="${habit.image}" alt="${habit.name}" class="progress-habit-image">
                <div>
                    <div class="progress-habit-title">${habit.name}</div>
                    <div class="progress-habit-type">${habit.type} habit</div>
                </div>
            </div>
            <div class="progress-stats">
                <div class="progress-stat">
                    <div class="progress-stat-value">${habitData.streak}</div>
                    <div class="progress-stat-label">Current</div>
                </div>
                <div class="progress-stat">
                    <div class="progress-stat-value">${habitData.bestStreak}</div>
                    <div class="progress-stat-label">Best</div>
                </div>
                <div class="progress-stat">
                    <div class="progress-stat-value">${completionRate}%</div>
                    <div class="progress-stat-label">Success</div>
                </div>
            </div>
            <div class="progress-chart-container">
                <div class="progress-chart-title">Last 7 Days</div>
                <div class="progress-chart" id="chart-${habitId}"></div>
                <div class="chart-labels" id="labels-${habitId}"></div>
            </div>
        `;
        
        progressHabitsList.appendChild(progressCard);
        
        // Generate chart for this habit
        generateProgressChart(habitId, habitData);
    });
}

function generateProgressChart(habitId, habitData) {
    const chartContainer = document.getElementById(`chart-${habitId}`);
    const labelsContainer = document.getElementById(`labels-${habitId}`);
    
    if (!chartContainer || !labelsContainer) return;
    
    // Get last 7 days
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        last7Days.push({
            date: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            completed: habitData.completedDays.includes(dateString)
        });
    }
    
    // Clear containers
    chartContainer.innerHTML = '';
    labelsContainer.innerHTML = '';
    
    // Create bars
    last7Days.forEach(day => {
        const bar = document.createElement('div');
        bar.className = `chart-bar ${day.completed ? 'completed' : 'missed'}`;
        bar.style.height = day.completed ? '100%' : '20%';
        chartContainer.appendChild(bar);
        
        const label = document.createElement('div');
        label.textContent = `${day.date}/${day.month}`;
        labelsContainer.appendChild(label);
    });
}

// Initialize App - Modified to use AuthManager
// Initialized at the top using authManager listeners

// Make all additional functions available globally
window.markHabitComplete = markHabitComplete;
window.undoHabitComplete = undoHabitComplete;
window.updateHomeScreen = updateHomeScreen;
window.addHabit = window.addHabit; // Make sure addHabit is global
window.deleteHabit = window.deleteHabit; // Make sure deleteHabit is global
window.saveDailyNotes = window.saveDailyNotes; // Make sure saveDailyNotes is global
window.saveData = saveData; // Use the AuthManager version of saveData

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {}); // Do nothing as initApp is managed by auth
} else {
   // Do nothing as initApp is managed by auth
}
