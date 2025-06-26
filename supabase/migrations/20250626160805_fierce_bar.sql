/*
  # User Profiles and Habit Data Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `name` (text)
      - `share_progress` (boolean, default false)
      - `created_at` (timestamp)
      - `last_login` (timestamp)
    
    - `user_habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `habit_id` (text)
      - `habit_type` (text - 'build' or 'break')
      - `start_date` (date)
      - `active` (boolean)
      - `streak` (integer)
      - `best_streak` (integer)
      - `total_days` (integer)
      - `created_at` (timestamp)
    
    - `habit_completions`
      - `id` (uuid, primary key)
      - `user_habit_id` (uuid, references user_habits)
      - `completion_date` (date)
      - `notes` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Profiles are automatically created when users sign up
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  share_progress boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

-- Create user_habits table
CREATE TABLE IF NOT EXISTS user_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  habit_id text NOT NULL,
  habit_type text NOT NULL CHECK (habit_type IN ('build', 'break')),
  start_date date DEFAULT CURRENT_DATE,
  active boolean DEFAULT true,
  streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  total_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_habit_id uuid REFERENCES user_habits(id) ON DELETE CASCADE NOT NULL,
  completion_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_habit_id, completion_date)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- User habits policies
CREATE POLICY "Users can view own habits"
  ON user_habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON user_habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON user_habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON user_habits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Habit completions policies
CREATE POLICY "Users can view own completions"
  ON habit_completions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_habits 
      WHERE user_habits.id = habit_completions.user_habit_id 
      AND user_habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own completions"
  ON habit_completions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_habits 
      WHERE user_habits.id = habit_completions.user_habit_id 
      AND user_habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own completions"
  ON habit_completions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_habits 
      WHERE user_habits.id = habit_completions.user_habit_id 
      AND user_habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own completions"
  ON habit_completions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_habits 
      WHERE user_habits.id = habit_completions.user_habit_id 
      AND user_habits.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'User')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();