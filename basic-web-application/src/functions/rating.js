import { initdb } from '../firebase/init';
import { defineStore } from "pinia";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { ref } from 'vue';

export const useRating = defineStore('rating', () => {
  const ratings = ref([]);

  const getRating = async (programID) => {
    const db = initdb();

    const q = query(collection(db, "ratings"), where("programID", "==", programID));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      ratings.value = [{
        user: '',
        rating: 0,
        comment: ''
      }];
    }

    ratings.value = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        user: data.user,
        rating: data.rating,
        comment: data.comment
      }
    });
  };

  const addRating = async (ratingData, programID) => {
    const docData = {
      user: ratingData.user,
      rating: ratingData.rating,
      comment: ratingData.comment,
      programID: programID
    };
    // console.log(docData);
    const db = initdb();

    const docRef = await addDoc(collection(db, 'ratings'), docData);
    console.log('Rating added with ID: ', docRef.id);
  };

  return {
    ratings,
    getRating,
    addRating
  }
});
