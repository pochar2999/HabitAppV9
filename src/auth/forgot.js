import { auth } from '../firebase-config.js';
import { sendPasswordResetEmail } from 'firebase/auth';

const forgotForm = document.getElementById('forgot-form');
const messageDiv = document.getElementById('message');
const submitBtn = document.getElementById('submit-btn');

forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = forgotForm.email.value.trim();

  if (!email) {
    showMessage('Please enter your email address.', 'error');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending Reset Email...';

    await sendPasswordResetEmail(auth, email);
    showMessage('Password reset email sent! Check your inbox and follow the instructions.', 'success');
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 3000);

  } catch (error) {
    let errorMessage = 'An error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
    }
    
    showMessage(errorMessage, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Reset Email';
  }
});

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
}