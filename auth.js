
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config.js';

// Sign up function with email verification
export async function signUp(name, email, password) {
  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      habitsActive: [],
      habitsCompleted: [],
      friends: [],
      createdAt: new Date().toISOString()
    });
    
    return { success: true, message: "Account created! Please check your email for verification." };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Login function with email verification check
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      await signOut(auth);
      return { success: false, message: "Please verify your email before logging in." };
    }
    
    return { success: true, message: "Login successful!", user: user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Logout function
export async function logout() {
  try {
    await signOut(auth);
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Auth state observer
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
