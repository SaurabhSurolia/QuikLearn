import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Changed to simple getAuth
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAh3Och2RkruvnZEWrtjcEYBmEYjCT1UKk",
  authDomain: "quiklearn-390ee.firebaseapp.com",
  projectId: "quiklearn-390ee",
  storageBucket: "quiklearn-390ee.firebasestorage.app",
  messagingSenderId: "994529781102",
  appId: "1:994529781102:web:c4abcecd6e55e0b6220d7f"
};

const app = initializeApp(firebaseConfig);

// Simplified Auth (Works automatically)
const auth = getAuth(app);

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };