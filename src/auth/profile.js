import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (user && user.emailVerified) {
    currentUser = user;
    await loadUserProfile(user);
  } else {
    window.location.href = 'login.html';
  }
});

async function loadUserProfile(user) {
  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      
      document.getElementById('username').textContent = userData.name || user.displayName || 'User';
      document.getElementById('email').textContent = userData.email || user.email;
      document.getElementById('member-since').textContent = formatDate(userData.createdAt?.toDate() || user.metadata.creationTime);
      document.getElementById('last-login').textContent = formatDate(userData.lastLogin?.toDate() || user.metadata.lastSignInTime);
      document.getElementById('active-habits').textContent = userData.habitsActive?.length || 0;
      document.getElementById('total-habits').textContent = (userData.habitsActive?.length || 0) + (userData.habitsCompleted?.length || 0);
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

function formatDate(date) {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error signing out:', error);
  }
});

// Continue to app functionality
document.getElementById('continue-btn').addEventListener('click', () => {
  window.location.href = 'index.html';
});