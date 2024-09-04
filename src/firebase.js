// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCySuYZvAoIO0bB-0uowOq-U8fiT0effQ",
  authDomain: "emms-5d268.firebaseapp.com",
  databaseURL: "https://emms-5d268-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "emms-5d268",
  storageBucket: "emms-5d268.appspot.com",
  messagingSenderId: "481082533964",
  appId: "1:481082533964:web:a64b455a07560327556ce9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
