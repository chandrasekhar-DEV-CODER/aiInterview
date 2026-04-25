// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrk6OBZYJ2C29JrGuHcs-BW9VqDdPz-Ig",
  authDomain: "interview-530d6.firebaseapp.com",
  projectId: "interview-530d6",
  storageBucket: "interview-530d6.appspot.com",
  messagingSenderId: "195152524135",
  appId: "1:195152524135:web:e48a01185af8423599f5c2",
  measurementId: "G-T46RVW8EBQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Only initialize analytics in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { auth, provider, analytics };
