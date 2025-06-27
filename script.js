// App State Management
let currentScreen = 'home';
let currentHabit = null;
let habitType = null;
let appData = {
    user: 'User',
    daysLogged: 0,
    activeHabits: [],
    habits: {},
    dailyNotes: {}
};

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

// Local Storage Functions
function saveData() {
    localStorage.setItem('habitFlowData', JSON.stringify(appData));
}

function loadData() {
    const saved = localStorage.getItem('habitFlowData');
    if (saved) {
        appData = { ...appData, ...JSON.parse(saved) };
    }
}

// Navigation Functions
function navigateTo(screen) {
    // Hide current screen
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Show target screen
    document.getElementById(screen + '-screen').classList.add('active');
    
    // Update navigation state
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${screen}"]`)?.classList.add('active');
    
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

// Home Screen Functions
function updateHomeScreen() {
    const greeting = document.getElementById('greeting');
    const daysLogged = document.getElementById('days-logged');
    const activeHabits = document.getElementById('active-habits');
    
    greeting.textContent = `Welcome back, ${appData.user}!`;
    daysLogged.textContent = appData.daysLogged;
    activeHabits.textContent = appData.activeHabits.length;
}

// Search Functions
function searchHabits(type) {
    const searchInput = document.getElementById(`${type}-search`);
    const habitsList = document.getElementById(`${type}-habits-list`);
    const query = searchInput.value.toLowerCase();
    
    const cards = habitsList.querySelectorAll('.habit-card');
    cards.forEach(card => {
        const habitName = card.querySelector('h4').textContent.toLowerCase();
        const habitDescription = card.querySelector('p').textContent.toLowerCase();
        
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
    document.getElementById('strategy-title').textContent = habit.name + ' Strategy';
    document.getElementById('habit-description').textContent = habit.description;
    
    // Update methods
    const methodsList = document.getElementById('methods-list');
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
    
    // Show quote for break habits
    const quoteSection = document.getElementById('quote-section');
    if (habit.quote) {
        document.getElementById('motivational-quote').textContent = habit.quote;
        quoteSection.style.display = 'block';
    } else {
        quoteSection.style.display = 'none';
    }
    
    // Update start button text
    document.getElementById('start-habit-btn').textContent = 
        type === 'build' ? 'Start Habit Plan' : 'Start Breaking Plan';
    
    navigateTo('strategy');
}

function startHabit() {
    if (!currentHabit) return;
    
    const today = new Date().toDateString();
    
    // Initialize habit data
    if (!appData.habits[currentHabit]) {
        appData.habits[currentHabit] = {
            startDate: today,
            streak: 0,
            bestStreak: 0,
            completedDays: [],
            totalDays: 0,
            currentMethod: 0,
            active: true
        };
        
        // Add to active habits if not already there
        if (!appData.activeHabits.includes(currentHabit)) {
            appData.activeHabits.push(currentHabit);
        }
    } else {
        // Reactivate habit if it was inactive
        appData.habits[currentHabit].active = true;
        if (!appData.activeHabits.includes(currentHabit)) {
            appData.activeHabits.push(currentHabit);
        }
    }
    
    saveData();
    navigateTo('habits');
}

// Habits Management Screen Functions
function updateHabitsScreen() {
    const noHabitsMessage = document.getElementById('no-habits-message');
    const activeHabitsList = document.getElementById('active-habits-list');
    
    if (appData.activeHabits.length === 0) {
        noHabitsMessage.style.display = 'block';
        activeHabitsList.innerHTML = '';
        return;
    }
    
    noHabitsMessage.style.display = 'none';
    activeHabitsList.innerHTML = '';
    
    appData.activeHabits.forEach(habitId => {
        const habit = habitsData[habitId];
        const habitData = appData.habits[habitId];
        
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
    const habitData = appData.habits[habitId];
    
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
    appData.daysLogged += 1;
    
    saveData();
    updateHabitsScreen();
    showSuccessMessage();
}

function undoHabitComplete(habitId) {
    const today = new Date().toDateString();
    const habitData = appData.habits[habitId];
    
    if (!habitData || !habitData.completedDays.includes(today)) {
        return;
    }
    
    // Remove today from completed days
    habitData.completedDays = habitData.completedDays.filter(date => date !== today);
    habitData.streak = Math.max(0, habitData.streak - 1);
    habitData.totalDays = Math.max(0, habitData.totalDays - 1);
    
    // Decrement days logged
    appData.daysLogged = Math.max(0, appData.daysLogged - 1);
    
    saveData();
    updateHabitsScreen();
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
    
    if (appData.activeHabits.length === 0) {
        noProgressMessage.style.display = 'block';
        progressHabitsList.innerHTML = '';
        return;
    }
    
    noProgressMessage.style.display = 'none';
    progressHabitsList.innerHTML = '';
    
    appData.activeHabits.forEach(habitId => {
        const habit = habitsData[habitId];
        const habitData = appData.habits[habitId];
        
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

// Initialize App
function initApp() {
    // Check authentication state
    import('./auth.js').then(({ onAuthChange, logout }) => {
        onAuthChange((user) => {
            if (user && user.emailVerified) {
                // User is authenticated and verified
                loadData();
                
                // Set up navigation
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const tab = btn.getAttribute('data-tab');
                        navigateTo(tab);
                    });
                });
                
                // Add logout functionality
                addLogoutButton();
                
                // Set initial screen
                navigateTo('home');
                
                // Update daily progress
                updateDailyProgress();
            } else {
                // User is not authenticated, redirect to login
                window.location.href = 'login.html';
            }
        });
    });
}

function addLogoutButton() {
    const header = document.querySelector('.header-content');
    if (header && !document.getElementById('logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.25);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
        `;
        
        logoutBtn.addEventListener('click', async () => {
            const { logout } = await import('./auth.js');
            await logout();
            window.location.href = 'login.html';
        });
        
        header.appendChild(logoutBtn);
    }
}

function updateDailyProgress() {
    const today = new Date().toDateString();
    const lastUpdate = localStorage.getItem('lastUpdate');
    
    if (lastUpdate !== today) {
        // New day - check streaks
        appData.activeHabits.forEach(habitId => {
            const habitData = appData.habits[habitId];
            if (habitData && habitData.active) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toDateString();
                
                // If they didn't complete yesterday and had a streak, reset it
                if (!habitData.completedDays.includes(yesterdayString) && habitData.streak > 0) {
                    habitData.streak = 0;
                }
            }
        });
        
        localStorage.setItem('lastUpdate', today);
        saveData();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initApp);