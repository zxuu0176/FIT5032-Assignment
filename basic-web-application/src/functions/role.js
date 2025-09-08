import { initdb } from '../firebase/init';
import { defineStore } from "pinia";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
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

  const addRole = async (newEmail, newRole) => {
    const db = initdb();
    const docData = {
      email: newEmail,
      role: newRole
    };

    const docRef = await addDoc(collection(db, 'roles'), docData);
    console.log('Rating added with ID: ', docRef.id);
  };

  return {
    role,
    getRole,
    addRole
  }
});

