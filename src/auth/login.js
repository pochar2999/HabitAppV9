import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const loginForm = document.getElementById('login-form');
const messageDiv = document.getElementById('message');
const submitBtn = document.getElementById('submit-btn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  if (!email || !password) {
    showMessage('Please fill in all fields.', 'error');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing In...';

    const userCred = await signInWithEmailAndPassword(auth, email, password);
    
    if (!userCred.user.emailVerified) {
      showMessage('Please verify your email before logging in. Check your inbox for the verification link.', 'error');
      return;
    }

    // Update last login time
    await updateDoc(doc(db, "users", userCred.user.uid), {
      lastLogin: new Date()
    });

    showMessage('Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    let errorMessage = 'Invalid email or password. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email. Please sign up first.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
    }
    
    showMessage(errorMessage, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
});

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
}