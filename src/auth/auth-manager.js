import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authInitialized = false;
    this.userDataLoaded = false;
    this.onAuthStateChangeCallbacks = [];
    this.onUserDataLoadCallbacks = [];
    
    // Initialize auth in background without blocking app
    this.initializeAuth();
  }

  initializeAuth() {
    console.log('Initializing Firebase Auth in background...');
    
    onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
      
      this.authInitialized = true;
      this.currentUser = user;
      
      if (user && user.emailVerified) {
        try {
          console.log('Loading user data for:', user.uid);
          await this.loadUserData(user.uid);
          this.userDataLoaded = true;
          
          // Update UI to show user is logged in
          this.updateAuthUI(user);
          
          console.log('User data loaded successfully');
          this.onUserDataLoadCallbacks.forEach(callback => callback(user));
          
        } catch (error) {
          console.error('Error loading user data:', error);
          this.userDataLoaded = true;
          
          // Initialize with empty data if loading fails
          this.initializeEmptyUserData();
          this.updateAuthUI(user);
          this.onUserDataLoadCallbacks.forEach(callback => callback(user));
        }
      } else {
        console.log('User not authenticated or email not verified');
        this.userDataLoaded = true;
        
        // Update UI to show login/signup buttons
        this.updateAuthUI(null);
        this.onUserDataLoadCallbacks.forEach(callback => callback(null));
      }
      
      this.onAuthStateChangeCallbacks.forEach(callback => callback(user));
    });
  }

  updateAuthUI(user) {
    // Update profile section in header
    const profileContainer = document.getElementById('profile-container');
    if (!profileContainer) return;

    if (user) {
      // User is logged in - show profile dropdown
      profileContainer.innerHTML = `
        <button id="profile-btn" class="profile-btn">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="Profile" class="profile-avatar">
        </button>
        <div id="profile-dropdown" class="profile-dropdown">
          <div class="profile-info">
            <div class="profile-name" id="profile-name">${user.displayName || user.email.split('@')[0]}</div>
            <div class="profile-email" id="profile-email">${user.email}</div>
          </div>
          <hr class="profile-divider">
          <button id="logout-btn" class="logout-btn">
            <span>Log Out</span>
          </button>
        </div>
      `;
      
      // Set up profile dropdown functionality
      this.setupProfileDropdown();
    } else {
      // User is not logged in - show login/signup buttons
      profileContainer.innerHTML = `
        <div class="auth-buttons">
          <button id="login-btn" class="auth-header-btn login">Login</button>
          <button id="signup-btn" class="auth-header-btn signup">Sign Up</button>
        </div>
      `;
      
      // Set up auth button functionality
      this.setupAuthButtons();
    }
  }

  setupProfileDropdown() {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (profileBtn && profileDropdown && logoutBtn) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
          profileDropdown.classList.remove('show');
        }
      });
      
      // Logout functionality
      logoutBtn.addEventListener('click', async () => {
        try {
          await this.logout();
        } catch (error) {
          console.error('Error signing out:', error);
        }
      });
    }
  }

  setupAuthButtons() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
    
    if (signupBtn) {
      signupBtn.addEventListener('click', () => {
        window.location.href = 'signup.html';
      });
    }
  }

  async loadUserData(userId) {
    try {
      console.log('Loading user data from Firestore for user:', userId);
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log('Found existing user data:', userData);
        
        // Load user's app data or initialize with defaults
        const appData = userData.appData || this.getDefaultAppData();
        
        // Update global app data
        if (window.appData) {
          window.appData = { ...this.getDefaultAppData(), ...appData };
          console.log('Updated global appData:', window.appData);
        }
        
        // Update greeting
        this.updateGreeting(userData, userId);
        
        console.log('User data loaded successfully');
        return appData;
      } else {
        console.log('New user detected, initializing default data');
        const defaultData = this.getDefaultAppData();
        
        // Save default data to Firestore for new user
        await this.saveNewUserData(userId, defaultData);
        
        if (window.appData) {
          window.appData = { ...defaultData };
        }
        
        console.log('New user initialized with default data');
        return defaultData;
      }
    } catch (error) {
      console.error('Error in loadUserData:', error);
      throw error;
    }
  }

  updateGreeting(userData, userId) {
    try {
      const user = this.currentUser;
      if (!user) return;

      // Update greeting
      const greeting = document.getElementById("greeting");
      if (greeting) {
        const displayName = userData.name || user.displayName || user.email.split('@')[0];
        greeting.textContent = `Welcome back, ${displayName}!`;
      }
    } catch (error) {
      console.error('Error updating greeting:', error);
    }
  }

  async saveNewUserData(userId, appData) {
    try {
      const userDocRef = doc(db, "users", userId);
      const user = this.currentUser;
      
      await setDoc(userDocRef, {
        userId: userId,
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        verified: user.emailVerified,
        appData: appData,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
      
      console.log('New user data saved to Firestore');
    } catch (error) {
      console.error('Error saving new user data:', error);
    }
  }

  async saveUserData(userId = null, appData = null) {
    const user = userId || this.currentUser?.uid;
    const dataToSave = appData || window.appData;
    
    if (!user || !dataToSave) {
      console.warn('Cannot save user data: missing user or data');
      return;
    }

    try {
      console.log('Saving user data to Firestore:', dataToSave);
      const userDocRef = doc(db, "users", user);
      
      // Use updateDoc to only update the appData field
      await updateDoc(userDocRef, {
        appData: dataToSave,
        lastUpdated: new Date()
      });
      
      console.log('User data saved successfully');
    } catch (error) {
      console.error('Error saving user data:', error);
      
      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        try {
          await setDoc(userDocRef, {
            userId: user,
            name: this.currentUser?.displayName || this.currentUser?.email?.split('@')[0] || 'User',
            email: this.currentUser?.email || '',
            verified: this.currentUser?.emailVerified || false,
            appData: dataToSave,
            createdAt: new Date(),
            lastUpdated: new Date()
          });
          console.log('User document created and data saved');
        } catch (createError) {
          console.error('Error creating user document:', createError);
        }
      }
    }
  }

  getDefaultAppData() {
    return {
      user: 'User',
      daysLogged: 0,
      activeHabits: [],
      habits: {},
      dailyNotes: {}
    };
  }

  initializeEmptyUserData() {
    if (window.appData) {
      window.appData = { ...this.getDefaultAppData() };
    }
  }

  // Check if user needs to login for certain actions
  requireAuth(action = 'perform this action') {
    if (!this.currentUser) {
      const shouldLogin = confirm(`Please log in to ${action}. Would you like to go to the login page?`);
      if (shouldLogin) {
        window.location.href = 'login.html';
      }
      return false;
    }
    return true;
  }

  async logout() {
    try {
      console.log('Logging out user');
      
      // Save current data before logout
      if (this.currentUser && window.appData) {
        await this.saveUserData();
      }
      
      await signOut(auth);
      
      // Clear user data
      this.currentUser = null;
      this.userDataLoaded = false;
      
      // Reset app data to default
      if (window.appData) {
        window.appData = { ...this.getDefaultAppData() };
      }
      
      // Update UI
      this.updateAuthUI(null);
      
      // Update home screen
      if (window.updateHomeScreen) {
        window.updateHomeScreen();
      }
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  onAuthStateChange(callback) {
    this.onAuthStateChangeCallbacks.push(callback);
  }

  onUserDataLoad(callback) {
    this.onUserDataLoadCallbacks.push(callback);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthInitialized() {
    return this.authInitialized;
  }

  isUserDataLoaded() {
    return this.userDataLoaded;
  }
}

// Create singleton instance
const authManager = new AuthManager();

export default authManager;