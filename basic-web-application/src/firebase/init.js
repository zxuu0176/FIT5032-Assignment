import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACCeU1cMCAdgdVprBKnk2OqqCPtweev2I",
  authDomain: "basic-web-application-a7857.firebaseapp.com",
  projectId: "basic-web-application-a7857",
  storageBucket: "basic-web-application-a7857.firebasestorage.app",
  messagingSenderId: "97325884379",
  appId: "1:97325884379:web:66fde2d7d6e02bf6bffdfe"
};

initializeApp(firebaseConfig);
const db = getFirestore();

export const initFirebase = () => {
  return initializeApp(firebaseConfig);
};
export const initdb = () => {
  return db;
};
