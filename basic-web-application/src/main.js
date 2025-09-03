import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { initializeApp } from "firebase/app";
import App from './App.vue'
import router from './router'

const firebaseConfig = {
  apiKey: "AIzaSyACCeU1cMCAdgdVprBKnk2OqqCPtweev2I",
  authDomain: "basic-web-application-a7857.firebaseapp.com",
  projectId: "basic-web-application-a7857",
  storageBucket: "basic-web-application-a7857.firebasestorage.app",
  messagingSenderId: "97325884379",
  appId: "1:97325884379:web:66fde2d7d6e02bf6bffdfe"
};

const app = createApp(App)
initializeApp(firebaseConfig);
app.use(router);
app.mount('#app');
