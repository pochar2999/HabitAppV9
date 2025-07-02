# Custom Habit Preferences Implementation Guide

This guide explains how to add custom input fields for any habit in the HabitFlow app.

## Overview

The system allows you to define custom preference fields for specific habits that users can configure. These preferences are stored in Firestore and linked to the user's account.

## Firebase Schema

```
users/{userId}/
├── habits: { habitId: habitData }
├── habitCompletion: { date: [habitIds] }
├── activityLog: { date: boolean }
└── habitPreferences: {
    habitId: {
      field1: value1,
      field2: value2,
      lastUpdated: timestamp
    }
  }
```

## Step-by-Step Implementation

### 1. Define Preference Configuration

Add your habit configuration to `src/data/habitPreferences.js`:

```javascript
export const habitPreferencesConfig = {
  'your-habit-id': {
    fields: [
      {
        key: 'fieldName',           // Unique field identifier
        label: 'Display Label',     // User-facing label
        type: 'number',             // Field type (see types below)
        min: 1,                     // For number fields
        max: 100,                   // For number fields
        defaultValue: 10,           // Default value
        required: true,             // Whether field is required
        description: 'Help text'    // Description shown to user
      }
      // Add more fields as needed
    ]
  }
}
```

### 2. Available Field Types

#### Number Field
```javascript
{
  key: 'duration',
  label: 'Duration (minutes)',
  type: 'number',
  min: 1,
  max: 120,
  defaultValue: 30,
  required: true,
  description: 'How long should each session last?'
}
```

#### Text Field
```javascript
{
  key: 'location',
  label: 'Preferred Location',
  type: 'text',
  placeholder: 'e.g., Home gym, Park',
  description: 'Where do you prefer to do this activity?'
}
```

#### Select Dropdown
```javascript
{
  key: 'difficulty',
  label: 'Difficulty Level',
  type: 'select',
  options: [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ],
  defaultValue: 'beginner',
  description: 'Choose your current skill level'
}
```

#### Time List (for reminders)
```javascript
{
  key: 'reminderTimes',
  label: 'Reminder Times',
  type: 'time-list',
  placeholder: '9:00 AM, 12:00 PM, 6:00 PM',
  description: 'When should we remind you? (comma-separated)'
}
```

### 3. How It Works

1. **Modal Trigger**: When users click on a habit that has custom preferences, a modal opens
2. **Load Existing Data**: The modal loads any existing preferences from Firestore
3. **Form Rendering**: Fields are dynamically rendered based on the configuration
4. **Save to Firestore**: Preferences are saved to `users/{uid}/habitPreferences/{habitId}`
5. **Display Summary**: A summary of key preferences is shown on the habit card

### 4. Adding a New Habit with Preferences

Example: Adding "Sleep Early" habit with custom fields:

```javascript
// In src/data/habitPreferences.js
'sleep-early': {
  fields: [
    {
      key: 'targetBedtime',
      label: 'Target Bedtime',
      type: 'text',
      placeholder: '10:00 PM',
      defaultValue: '10:00 PM',
      required: true,
      description: 'What time do you want to go to bed?'
    },
    {
      key: 'sleepHours',
      label: 'Desired Sleep Hours',
      type: 'number',
      min: 6,
      max: 12,
      defaultValue: 8,
      description: 'How many hours of sleep do you need?'
    },
    {
      key: 'windDownActivity',
      label: 'Wind-down Activity',
      type: 'select',
      options: [
        { value: 'reading', label: 'Reading' },
        { value: 'meditation', label: 'Meditation' },
        { value: 'music', label: 'Listening to music' },
        { value: 'bath', label: 'Taking a bath' }
      ],
      description: 'What helps you relax before bed?'
    }
  ]
}
```

### 5. Accessing Preferences in Your Code

```javascript
// In any component
import { useHabits } from '../contexts/HabitContext'

function MyComponent() {
  const { getHabitPreferences } = useHabits()
  
  const waterPrefs = getHabitPreferences('drink-water')
  console.log(waterPrefs.dailyGlasses) // Access specific preference
}
```

### 6. Testing Your Implementation

1. Add the habit configuration to `habitPreferences.js`
2. Ensure the habit exists in your habits data
3. Start the habit from the Strategy screen
4. Go to "My Habits" and click on the habit
5. The preferences modal should open with your custom fields
6. Fill out the form and save
7. Verify the data is saved in Firestore
8. Check that the summary appears on the habit card

## Best Practices

1. **Keep it Simple**: Don't overwhelm users with too many fields
2. **Provide Defaults**: Always include sensible default values
3. **Clear Labels**: Use descriptive labels and help text
4. **Validation**: Use min/max values for numbers to prevent invalid input
5. **Progressive Disclosure**: Show only the most important preferences in the summary

## Troubleshooting

- **Modal not opening**: Check that the habit ID exists in `habitPreferencesConfig`
- **Data not saving**: Verify Firebase permissions and user authentication
- **Fields not rendering**: Check the field type and configuration syntax
- **Preferences not loading**: Ensure the user has permission to read their Firestore document

## Future Enhancements

You can extend this system by:
- Adding new field types (date, time, color picker, etc.)
- Implementing field validation rules
- Adding conditional fields (show field B only if field A has certain value)
- Creating preset configurations for common habits
- Adding import/export functionality for preferences