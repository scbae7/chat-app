// src/firebase.js (이전에 만든 파일)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBYY3yjgOlr2-H9_LA9v1jwqVZU4hMYts",
  authDomain: "chat-app-15628.firebaseapp.com",
  projectId: "chat-app-15628",
  storageBucket: "chat-app-15628.firebasestorage.app",
  messagingSenderId: "903415581241",
  appId: "1:903415581241:web:71d19122d3533c5830dbe8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
