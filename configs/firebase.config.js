import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDp1n6Khtl23X4_PVANQ1oMfjEeaXKlZAs",
  authDomain: "zalo-cnm.firebaseapp.com",
  projectId: "zalo-cnm",
  storageBucket: "zalo-cnm.appspot.com",
  messagingSenderId: "855420877390",
  appId: "1:855420877390:web:a728c6e10d63c430c1e11f",
  measurementId: "G-7QW2BHJYXH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);