import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authInitialized = false;
    this.userDataLoaded = false;
    this.onAuthStateChangeCallbacks = [];
    this.onUserDataLoadCallbacks = [];
    
    this.initializeAuth();
  }

  initializeAuth() {
    console.log('Initializing Firebase Auth...');
    
    onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
      
      this.authInitialized = true;
      this.currentUser = user;
      
      if (user && user.emailVerified) {
        try {
          console.log('Loading user data for:', user.uid);
          await this.loadUserData(user.uid);
          this.userDataLoaded = true;
          
          console.log('User data loaded, notifying callbacks');
          // Notify callbacks that user data is loaded
          this.onUserDataLoadCallbacks.forEach(callback => callback(user));
          
        } catch (error) {
          console.error('Error loading user data:', error);
          this.userDataLoaded = true; // Still mark as loaded to prevent infinite loading
          
          // Initialize with empty data if loading fails
          this.initializeEmptyUserData();
          this.onUserDataLoadCallbacks.forEach(callback => callback(user));
        }
      } else {
        // User not authenticated or email not verified
        console.log('User not authenticated or email not verified');
        this.userDataLoaded = false;
        
        // Only redirect if we're not on an auth page and not in the middle of auth flow
        if (!this.isAuthPage()) {
          console.log('Redirecting to login page');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 100);
        } else {
          // We're on an auth page, notify callbacks to hide loading screen
          this.onUserDataLoadCallbacks.forEach(callback => callback(null));
        }
      }
      
      // Notify auth state change callbacks
      this.onAuthStateChangeCallbacks.forEach(callback => callback(user));
    });

    // Add timeout fallback
    setTimeout(() => {
      if (!this.authInitialized) {
        console.warn('Auth initialization timeout, forcing initialization');
        this.authInitialized = true;
        this.userDataLoaded = true;
        
        if (!this.isAuthPage()) {
          window.location.href = 'login.html';
        } else {
          this.onUserDataLoadCallbacks.forEach(callback => callback(null));
        }
      }
    }, 8000);
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
          // Reset to clean state first, then merge user data
          window.appData = { ...this.getDefaultAppData(), ...appData };
          console.log('Updated global appData:', window.appData);
        }
        
        // Update UI elements with user info
        this.updateUserProfile(userData, userId);
        
        console.log('User data loaded successfully');
        return appData;
      } else {
        // New user - initialize with default data
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
      await setDoc(userDocRef, {
        appData: dataToSave,
        lastUpdated: new Date()
      }, { merge: true });
      
      console.log('User data saved successfully');
    } catch (error) {
      console.error('Error saving user data:', error);
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

  updateUserProfile(userData, userId) {
    try {
      const user = this.currentUser;
      if (!user) return;

      // Update greeting
      const greeting = document.getElementById("greeting");
      if (greeting) {
        const displayName = userData.name || user.displayName || user.email.split('@')[0];
        greeting.textContent = `Welcome back, ${displayName}!`;
      }

      // Update profile dropdown
      const profileName = document.getElementById("profile-name");
      const profileEmail = document.getElementById("profile-email");
      
      if (profileName) {
        profileName.textContent = userData.name || user.displayName || user.email.split('@')[0];
      }
      
      if (profileEmail) {
        profileEmail.textContent = user.email;
      }

      // Show profile button
      const profileBtn = document.getElementById('profile-btn');
      if (profileBtn) {
        profileBtn.style.display = 'block';
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  isAuthPage() {
    const authPages = ['login.html', 'signup.html', 'forgot.html', 'verify.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    return authPages.includes(currentPage);
  }

  async logout() {
    try {
      console.log('Logging out user');
      await signOut(auth);
      
      // Clear user data
      this.currentUser = null;
      this.userDataLoaded = false;
      
      // Reset app data
      if (window.appData) {
        window.appData = { ...this.getDefaultAppData() };
      }
      
      // Redirect to login
      window.location.href = 'login.html';
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