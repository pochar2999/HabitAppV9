// App State Management
let currentScreen = 'home';
let currentHabit = null;
let habitType = null;
let appData = {
    user: 'User',
    daysLogged: 0,
    currentHabit: null,
    habits: {},
    dailyNotes: {}
};

// Habit Data
const habitsData = {
    'drink-water': {
        name: 'Drink More Water',
        type: 'build',
        icon: '💧',
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
        icon: '🌅',
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
        icon: '🧘',
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
        icon: '⏰',
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
        icon: '📱',
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
        case 'tracker':
            updateTrackerScreen();
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
    
    greeting.textContent = `Welcome back, ${appData.user}!`;
    daysLogged.textContent = appData.daysLogged;
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
            currentMethod: 0
        };
    }
    
    appData.currentHabit = currentHabit;
    saveData();
    
    navigateTo('tracker');
}

// Tracker Screen Functions
function updateTrackerScreen() {
    if (!appData.currentHabit) {
        // No active habit
        document.querySelector('.tracker-content').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>No Active Habit</h3>
                <p>Start a habit from the home screen to begin tracking!</p>
                <button onclick="navigateTo('home')" class="start-btn">Go to Home</button>
            </div>
        `;
        return;
    }
    
    const habit = habitsData[appData.currentHabit];
    const habitData = appData.habits[appData.currentHabit];
    
    // Update habit title and streak
    document.getElementById('current-habit-title').textContent = habit.name;
    document.getElementById('streak-count').textContent = habitData.streak;
    
    // Update current method
    const methodIndex = habitData.currentMethod || 0;
    const currentMethod = habit.methods[methodIndex];
    document.getElementById('current-method').innerHTML = `
        <strong>${currentMethod.title}:</strong> ${currentMethod.description}
    `;
    
    // Update action button
    const actionBtn = document.getElementById('action-btn');
    const today = new Date().toDateString();
    const completedToday = habitData.completedDays.includes(today);
    
    if (habit.type === 'build') {
        actionBtn.textContent = completedToday ? 'Completed Today!' : 'Mark as Done';
        actionBtn.className = completedToday ? 'action-btn completed' : 'action-btn';
    } else {
        actionBtn.textContent = completedToday ? 'Resisted Today!' : 'Resist Temptation';
        actionBtn.className = completedToday ? 'action-btn completed' : 'action-btn resist';
    }
    
    // Update success rate
    const successRate = habitData.totalDays > 0 ? 
        Math.round((habitData.completedDays.length / habitData.totalDays) * 100) : 0;
    document.getElementById('success-rate').textContent = successRate + '%';
    
    // Load today's note
    const noteTextarea = document.getElementById('daily-note');
    noteTextarea.value = appData.dailyNotes[today] || '';
}

function markComplete() {
    if (!appData.currentHabit) return;
    
    const today = new Date().toDateString();
    const habitData = appData.habits[appData.currentHabit];
    
    if (habitData.completedDays.includes(today)) {
        // Already completed today
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
    
    // Cycle through methods every 7 days
    if (habitData.streak % 7 === 0) {
        const habit = habitsData[appData.currentHabit];
        habitData.currentMethod = (habitData.currentMethod + 1) % habit.methods.length;
    }
    
    saveData();
    updateTrackerScreen();
    
    // Show success message
    showSuccessMessage();
}

function saveNote() {
    const noteTextarea = document.getElementById('daily-note');
    const today = new Date().toDateString();
    
    appData.dailyNotes[today] = noteTextarea.value;
    saveData();
    
    // Show saved message
    const saveBtn = document.querySelector('.save-note-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    setTimeout(() => {
        saveBtn.textContent = originalText;
    }, 1500);
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #7ED321, #4A90E2);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 18px;
        font-weight: bold;
        z-index: 1000;
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
    if (!appData.currentHabit) {
        document.querySelector('.progress-content').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>No Active Habit</h3>
                <p>Start a habit to see your progress!</p>
                <button onclick="navigateTo('home')" class="start-btn">Go to Home</button>
            </div>
        `;
        return;
    }
    
    const habitData = appData.habits[appData.currentHabit];
    
    // Update stats
    document.getElementById('total-days').textContent = habitData.totalDays;
    document.getElementById('current-streak').textContent = habitData.streak;
    document.getElementById('best-streak').textContent = habitData.bestStreak;
    
    // Update completion rate
    const completionRate = habitData.totalDays > 0 ? 
        Math.round((habitData.completedDays.length / habitData.totalDays) * 100) : 0;
    
    document.getElementById('completion-fill').style.width = completionRate + '%';
    document.getElementById('completion-text').textContent = completionRate + '%';
    
    // Update chart
    updateProgressChart(habitData);
}

function updateProgressChart(habitData) {
    const canvas = document.getElementById('progress-chart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get last 7 days of data
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        last7Days.push({
            date: date.getDate(),
            completed: habitData.completedDays.includes(dateString)
        });
    }
    
    // Chart dimensions
    const padding = 20;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    const barWidth = chartWidth / 7;
    
    // Draw bars
    last7Days.forEach((day, index) => {
        const x = padding + (index * barWidth) + (barWidth * 0.1);
        const barHeight = day.completed ? chartHeight * 0.8 : chartHeight * 0.2;
        const y = padding + chartHeight - barHeight;
        
        // Draw bar
        ctx.fillStyle = day.completed ? '#7ED321' : '#e0e0e0';
        ctx.fillRect(x, y, barWidth * 0.8, barHeight);
        
        // Draw day label
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(day.date, x + (barWidth * 0.4), canvas.height - 5);
    });
}

// Initialize App
function initApp() {
    loadData();
    
    // Set up navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            navigateTo(tab);
        });
    });
    
    // Set initial screen
    navigateTo('home');
    
    // Update daily progress
    updateDailyProgress();
}

function updateDailyProgress() {
    const today = new Date().toDateString();
    const lastUpdate = localStorage.getItem('lastUpdate');
    
    if (lastUpdate !== today) {
        // New day - update streak if needed
        if (appData.currentHabit) {
            const habitData = appData.habits[appData.currentHabit];
            if (!habitData.completedDays.includes(today)) {
                // Missed a day - reset streak
                habitData.streak = 0;
            }
        }
        
        localStorage.setItem('lastUpdate', today);
        saveData();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initApp);