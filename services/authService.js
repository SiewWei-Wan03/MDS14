// src/services/authService.js

import { auth, database } from '../firebase'; // Import Firebase authentication and database
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth methods
import { ref, set } from "firebase/database"; // Import Firebase database methods

// Function to handle custom error messages
const getFriendlyErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please use a different email.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed. Please contact support.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Function to register a doctor
export const registerDoctor = async (doctorID, password) => {
  try {
    // Create a new user with the doctorID as the email
    const userCredential = await createUserWithEmailAndPassword(auth, `${doctorID}@yourdomain.com`, password);
    const user = userCredential.user;

    // Save additional doctor information in the database
    await set(ref(database, `doctors/${user.uid}`), {
      doctorID: doctorID,
      createdAt: new Date().toISOString()
    });

    console.log('Doctor registered successfully:', user);
    return { success: true, data: user }; // Return success object
  } catch (error) {
    console.error('Error registering doctor:', error);
    const friendlyMessage = getFriendlyErrorMessage(error.code); // Get a friendly error message
    return { success: false, message: friendlyMessage }; // Return friendly error message
  }
};

// Function to login a doctor
export const loginDoctor = async (doctorID, password) => {
  try {
    // Login with the doctorID as the email
    const userCredential = await signInWithEmailAndPassword(auth, `${doctorID}@yourdomain.com`, password);
    const user = userCredential.user;

    console.log('Doctor logged in successfully:', user);
    return { success: true, data: user }; // Return success object
  } catch (error) {
    console.error('Error logging in:', error);
    const friendlyMessage = getFriendlyErrorMessage(error.code); // Get a friendly error message
    return { success: false, message: friendlyMessage }; // Return friendly error message
  }
};
