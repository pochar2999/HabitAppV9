import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAK3KSNQ60sZStGZ5ir_fn6VWPBkzUd_Oo",
  authDomain: "habit-app-f43cc.firebaseapp.com",
  projectId: "habit-app-f43cc",
  storageBucket: "habit-app-f43cc.firebasestorage.app",
  messagingSenderId: "387442825456",
  appId: "1:387442825456:web:5ff306ef842351197d4a35",
  measurementId: "G-X442N3W6V1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);