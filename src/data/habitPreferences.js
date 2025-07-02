// Configuration for habit-specific preferences
export const habitPreferencesConfig = {
  'drink-water': {
    fields: [
      {
        key: 'dailyGlasses',
        label: 'Daily Water Goal (glasses)',
        type: 'number',
        min: 1,
        max: 20,
        defaultValue: 8,
        required: true,
        description: 'How many glasses of water do you want to drink per day?'
      },
      {
        key: 'totalAmount',
        label: 'Total Daily Amount (ml)',
        type: 'number',
        min: 500,
        max: 5000,
        defaultValue: 2000,
        required: true,
        description: 'Total amount of water in milliliters'
      },
      {
        key: 'reminderTimes',
        label: 'Reminder Times',
        type: 'time-list',
        placeholder: '9:00 AM, 12:00 PM, 3:00 PM, 6:00 PM',
        description: 'When would you like to be reminded to drink water?'
      },
      {
        key: 'glassSize',
        label: 'Glass Size (ml)',
        type: 'select',
        options: [
          { value: '200', label: '200ml (Small glass)' },
          { value: '250', label: '250ml (Standard glass)' },
          { value: '300', label: '300ml (Large glass)' },
          { value: '500', label: '500ml (Water bottle)' }
        ],
        defaultValue: '250',
        description: 'What size container do you typically use?'
      }
    ]
  },
  'meditation': {
    fields: [
      {
        key: 'duration',
        label: 'Session Duration (minutes)',
        type: 'number',
        min: 1,
        max: 120,
        defaultValue: 10,
        required: true,
        description: 'How long do you want to meditate each day?'
      },
      {
        key: 'preferredTime',
        label: 'Preferred Time',
        type: 'select',
        options: [
          { value: 'morning', label: 'Morning (6-10 AM)' },
          { value: 'afternoon', label: 'Afternoon (12-4 PM)' },
          { value: 'evening', label: 'Evening (6-9 PM)' },
          { value: 'night', label: 'Night (9-11 PM)' }
        ],
        defaultValue: 'morning',
        description: 'When do you prefer to meditate?'
      },
      {
        key: 'meditationType',
        label: 'Meditation Type',
        type: 'select',
        options: [
          { value: 'mindfulness', label: 'Mindfulness' },
          { value: 'breathing', label: 'Breathing exercises' },
          { value: 'guided', label: 'Guided meditation' },
          { value: 'mantra', label: 'Mantra meditation' }
        ],
        defaultValue: 'mindfulness',
        description: 'What type of meditation interests you most?'
      },
      {
        key: 'reminderTime',
        label: 'Daily Reminder Time',
        type: 'text',
        placeholder: '7:00 AM',
        description: 'When should we remind you to meditate?'
      }
    ]
  },
  'exercise': {
    fields: [
      {
        key: 'duration',
        label: 'Exercise Duration (minutes)',
        type: 'number',
        min: 5,
        max: 180,
        defaultValue: 30,
        required: true,
        description: 'How long do you want to exercise each day?'
      },
      {
        key: 'exerciseType',
        label: 'Exercise Type',
        type: 'select',
        options: [
          { value: 'cardio', label: 'Cardio (running, cycling, etc.)' },
          { value: 'strength', label: 'Strength training' },
          { value: 'yoga', label: 'Yoga' },
          { value: 'walking', label: 'Walking' },
          { value: 'sports', label: 'Sports' },
          { value: 'mixed', label: 'Mixed activities' }
        ],
        defaultValue: 'mixed',
        description: 'What type of exercise do you prefer?'
      },
      {
        key: 'preferredTime',
        label: 'Preferred Time',
        type: 'select',
        options: [
          { value: 'early-morning', label: 'Early Morning (5-7 AM)' },
          { value: 'morning', label: 'Morning (7-10 AM)' },
          { value: 'afternoon', label: 'Afternoon (12-4 PM)' },
          { value: 'evening', label: 'Evening (5-8 PM)' }
        ],
        defaultValue: 'morning',
        description: 'When do you prefer to exercise?'
      },
      {
        key: 'weeklyGoal',
        label: 'Weekly Goal (days)',
        type: 'number',
        min: 1,
        max: 7,
        defaultValue: 5,
        description: 'How many days per week do you want to exercise?'
      }
    ]
  },
  'reading': {
    fields: [
      {
        key: 'dailyPages',
        label: 'Daily Reading Goal (pages)',
        type: 'number',
        min: 1,
        max: 100,
        defaultValue: 10,
        required: true,
        description: 'How many pages do you want to read each day?'
      },
      {
        key: 'preferredTime',
        label: 'Preferred Reading Time',
        type: 'select',
        options: [
          { value: 'morning', label: 'Morning' },
          { value: 'afternoon', label: 'Afternoon' },
          { value: 'evening', label: 'Evening' },
          { value: 'before-bed', label: 'Before bed' }
        ],
        defaultValue: 'evening',
        description: 'When do you prefer to read?'
      },
      {
        key: 'bookGenre',
        label: 'Preferred Genre',
        type: 'select',
        options: [
          { value: 'fiction', label: 'Fiction' },
          { value: 'non-fiction', label: 'Non-fiction' },
          { value: 'self-help', label: 'Self-help' },
          { value: 'biography', label: 'Biography' },
          { value: 'science', label: 'Science' },
          { value: 'mixed', label: 'Mixed genres' }
        ],
        defaultValue: 'mixed',
        description: 'What type of books do you enjoy most?'
      }
    ]
  },
  'wake-early': {
    fields: [
      {
        key: 'targetWakeTime',
        label: 'Target Wake Time',
        type: 'text',
        placeholder: '6:00 AM',
        defaultValue: '6:00 AM',
        required: true,
        description: 'What time do you want to wake up?'
      },
      {
        key: 'currentWakeTime',
        label: 'Current Wake Time',
        type: 'text',
        placeholder: '8:00 AM',
        description: 'What time do you currently wake up?'
      },
      {
        key: 'bedtimeGoal',
        label: 'Target Bedtime',
        type: 'text',
        placeholder: '10:00 PM',
        description: 'What time should you go to bed to get enough sleep?'
      },
      {
        key: 'sleepHours',
        label: 'Desired Sleep Hours',
        type: 'number',
        min: 6,
        max: 12,
        defaultValue: 8,
        description: 'How many hours of sleep do you need?'
      }
    ]
  }
}

// Helper function to get preference config for a habit
export function getHabitPreferenceConfig(habitId) {
  return habitPreferencesConfig[habitId] || null
}

// Helper function to check if a habit has custom preferences
export function hasCustomPreferences(habitId) {
  return habitId in habitPreferencesConfig
}