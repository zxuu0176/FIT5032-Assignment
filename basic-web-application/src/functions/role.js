import { initdb } from '../firebase/init';
import { defineStore } from "pinia";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ref } from 'vue';

export const useAuth = defineStore('auth', () => {
  const role = ref(null);

  const getRole = async (email) => {
    const db = initdb();

    const q = query(collection(db, "roles"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      role.value = null;
    }

    const doc = snapshot.docs[0];
    role.value = doc.data().role;
  };

  return {
    role,
    getRole
  }
});

