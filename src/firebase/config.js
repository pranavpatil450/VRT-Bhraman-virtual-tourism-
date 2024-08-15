import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
// here your configuration for firebase will come eg :-  apiKey: "xyz",
  // authDomain: "xyz",
  // projectId: "xyz,
  // storageBucket: "xyz",
  // messagingSenderId: "xyz",
  // appId: "xyz"
  };
  
  // Initialize Firebase
  export const app = initializeApp(firebaseConfig);
  export const storage = getStorage();
  export const db = getFirestore();
  export const auth = getAuth();