import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
  const database = getDatabase(app);

  export { database };