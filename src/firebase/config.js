import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCMxsXDhneIziyA_3yEEg-ZdjynJ5GTy40",
  authDomain: "tashomi-project.firebaseapp.com",
  projectId: "tashomi-project",
  storageBucket: "tashomi-project.firebasestorage.app",
  messagingSenderId: "302714012757",
  appId: "1:302714012757:web:e7886a2965fc7eb21d00dc",
  measurementId: "G-456NFXJFMB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };