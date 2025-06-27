import { auth, db } from '../firebase-config.js';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const signupForm = document.getElementById('signup-form');
const messageDiv = document.getElementById('message');
const submitBtn = document.getElementById('submit-btn');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = signupForm.name.value.trim();
  const email = signupForm.email.value.trim();
  const password = signupForm.password.value;
  const confirmPassword = signupForm.confirmPassword.value;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showMessage('Please fill in all fields.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Passwords do not match.', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters long.', 'error');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCred.user, { displayName: name });
    await sendEmailVerification(userCred.user);

    // Save user data to Firestore
    await setDoc(doc(db, "users", userCred.user.uid), {
      userId: userCred.user.uid,
      name,
      email,
      verified: false,
      habitsActive: [],
      habitsCompleted: [],
      friends: [],
      createdAt: new Date(),
      lastLogin: new Date()
    });

    showMessage('Account created successfully! Please check your email for verification link.', 'success');
    
    setTimeout(() => {
      window.location.href = 'verify.html';
    }, 2000);

  } catch (error) {
    let errorMessage = 'An error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered. Try logging in instead.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please choose a stronger password.';
        break;
    }
    
    showMessage(errorMessage, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
}