<template>
  <div class="resource-page">
    <div class="container mt-4">
      <h1>Basketball Programs for International Students</h1>
      <p>Join our basketball programs designed for international students at the university.</p>

      <!-- Programs List -->
      <div class="row mt-4">
        <div v-for="program in programs" :key="program.id" class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5>{{ program.title }}</h5>
                <span class="badge bg-secondary">{{ program.level }}</span>
              </div>

              <!-- Rating Display -->
              <div class="d-flex align-items-center mt-2">
                <div class="rating-display">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="{ 'filled': i <= Math.round(program.averageRating) }"
                  >
                    &#9733;
                  </span>
                  <span class="ms-2 text-muted">
                    {{ program.averageRating }} ({{ program.totalRatings }} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div class="card-body">
              <p>{{ program.description }}</p>

              <ul class="list-unstyled">
                <li><strong>Duration:</strong> {{ program.duration }}</li>
                <li><strong>Schedule:</strong> {{ program.schedule }}</li>
                <li><strong>Location:</strong> {{ program.location }}</li>
                <li><strong>Price:</strong> {{ program.price }}</li>
                <li><strong>Instructor:</strong> {{ program.instructor }}</li>
              </ul>

              <h6>What's Included:</h6>
              <ul>
                <li v-for="feature in program.features" :key="feature">{{ feature }}</li>
              </ul>

              <!-- Recent Reviews -->
              <div class="mb-3">
                <h6>Recent Reviews:</h6>
                <div class="reviews-container">
                  <div
                    v-for="review in program.ratings"
                    :key="review.user"
                    class="review-item bg-light p-2 rounded mb-2"
                  >
                    <div class="d-flex align-items-center mb-1">
                      <strong class="me-2">{{ review.user }}</strong>
                      <div class="rating-small">
                        <span
                          v-for="i in 5"
                          :key="i"
                          class="star small"
                          :class="{ 'filled': i <= review.rating }"
                        >
                          &starf;
                        </span>
                      </div>
                    </div>
                    <p class="mb-0 text-muted small">{{ review.comment }}</p>
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2 mb-3">
                <button @click="selectProgram(program.title)" class="btn btn-primary">
                  Register for this Program
                </button>
                <button
                  @click="toggleRatingForm(program.id)"
                  class="btn btn-success"
                  :class="{ 'btn-outline-success': selectedProgramForRating === program.id }"
                >
                  {{ selectedProgramForRating === program.id ? 'Cancel Rating' : 'Rate Program' }}
                </button>
              </div>

              <!-- Rating Form -->
              <div v-if="selectedProgramForRating === program.id" class="rating-form bg-light p-3 rounded">
                <h6>Rate this Program</h6>

                <div class="mb-3">
                  <label class="form-label">Your Name:</label>
                  <input
                    type="text"
                    v-model="newRating.user"
                    class="form-control"
                    placeholder="Enter your name"
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Rating:</label>
                  <div class="d-flex align-items-center">
                    <div class="rating-input">
                      <span
                        v-for="i in 5"
                        :key="i"
                        class="star interactive"
                        :class="{ 'filled': i <= newRating.rating, 'hover': i <= hoverRating }"
                        @click="setRating(i)"
                        @mouseenter="hoverRating = i"
                        @mouseleave="hoverRating = 0"
                      >
                        &#9733;
                      </span>
                    </div>
                    <span class="ms-2 text-muted small">
                      ({{ newRating.rating }}/5)
                    </span>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Comment:</label>
                  <textarea
                    v-model="newRating.comment"
                    class="form-control"
                    rows="3"
                    placeholder="Share your experience with this program..."
                  ></textarea>
                </div>

                <button
                  @click="submitRating(program.id)"
                  class="btn btn-success me-2"
                  :disabled="!canSubmitRating"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Registration Form -->
      <div class="row mt-5">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h4>Program Registration</h4>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Full Name</label>
                  <input
                    type="text"
                    v-model="form.name"
                    class="form-control"
                    placeholder="Enter your name"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    v-model="form.email"
                    class="form-control"
                    placeholder="Enter your email"
                  >
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Country</label>
                  <select v-model="form.country" class="form-select">
                    <option value="">Select your country</option>
                    <option v-for="country in countries" :key="country" :value="country">
                      {{ country }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Phone</label>
                  <input
                    type="tel"
                    v-model="form.phone"
                    class="form-control"
                    placeholder="Enter phone number"
                  >
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Basketball Experience</label>
                  <select v-model="form.experience" class="form-select">
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Program</label>
                  <select v-model="form.program" class="form-select">
                    <option value="">Select a program</option>
                    <option v-for="program in programs" :key="program.id" :value="program.title">
                      {{ program.title }}
                    </option>
                  </select>
                </div>
              </div>

              <button @click="submitRegistration" class="btn btn-success">
                Submit Registration
              </button>
              <button @click="clearForm" class="btn btn-secondary ms-2">
                Clear Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { initdb } from '../firebase/init';
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";

const form = ref({
  name: '',
  email: '',
  country: '',
  phone: '',
  experience: '',
  program: ''
});

const selectedProgramForRating = ref(null);
const hoverRating = ref(0);

const newRating = ref({
  rating: 0,
  comment: '',
  user: ''
});

const programs = ref([
  {
    id: 1,
    title: "Beginner International League",
    level: "Beginner",
    description: "Learn basketball basics in a friendly environment for international students.",
    duration: "12 weeks",
    schedule: "Saturdays 10:00 AM - 12:00 PM",
    location: "University Gym",
    price: "$150",
    instructor: "Coach Rodriguez",
    features: [
      "Basic skills training",
      "Game rules explanation",
      "Equipment provided",
      "Cultural activities"
    ],
    averageRating: 0,
    totalRatings: 0,
    ratings: []
  },
  {
    id: 2,
    title: "Intermediate Skills Program",
    level: "Intermediate",
    description: "Improve your basketball skills with structured training sessions.",
    duration: "16 weeks",
    schedule: "Tuesdays & Thursdays 6:00 PM - 8:00 PM",
    location: "Community Center",
    price: "$220",
    instructor: "Coach Kim",
    features: [
      "Advanced techniques",
      "Team strategies",
      "Fitness training",
      "Practice games"
    ],
    averageRating: 0,
    totalRatings: 0,
    ratings: []
  },
  {
    id: 3,
    title: "Competitive League",
    level: "Advanced",
    description: "Join competitive games and tournaments for experienced players.",
    duration: "Season (6 months)",
    schedule: "3 times per week",
    location: "Various venues",
    price: "$350",
    instructor: "Coach Thompson",
    features: [
      "Tournament play",
      "Professional coaching",
      "Team uniforms",
      "Statistics tracking"
    ],
    averageRating: 0,
    totalRatings: 0,
    ratings: []
  },
  {
    id: 4,
    title: "Cultural Exchange Program",
    level: "All Levels",
    description: "Basketball combined with cultural activities and friendship building.",
    duration: "8 weeks",
    schedule: "Sundays 2:00 PM - 4:00 PM",
    location: "Student Center",
    price: "$120",
    instructor: "Coach Chang",
    features: [
      "Mixed skill levels",
      "Cultural events",
      "Language practice",
      "Social activities"
    ],
    averageRating: 0,
    totalRatings: 0,
    ratings: []
  }
]);

const countries = ref([
  "China", "India", "South Korea", "Japan", "Brazil", "Mexico",
  "Germany", "France", "Canada", "Australia", "Other"
]);

const programSnapshots = ref({});

const getProgramRatings = (programId) => {
  const db = initdb();
  const q = query(collection(db, "ratings"), where("programID", "==", programId));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const index = programs.value.findIndex(p => p.id === programId);
    if (index === -1) return;

    const newRatings = snapshot.empty
      ? []
      : snapshot.docs.map(doc => ({ ...doc.data() }));

    programs.value[index].ratings = newRatings;

    const totalRatings = newRatings.length;
    const average =
      totalRatings > 0
        ? newRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    programs.value[index].totalRatings = totalRatings;
    programs.value[index].averageRating = Math.round(average * 10) / 10;
  });

  programSnapshots.value[programId] = unsubscribe;
};

onMounted(() => {
  programs.value.forEach(program => getProgramRatings(program.id));
});

onUnmounted(() => {
  Object.values(programSnapshots.value).forEach(unsubscribe => {
    if (typeof unsubscribe === 'function') unsubscribe();
  });
  programSnapshots.value = {};
});

const canSubmitRating = computed(() => {
  return newRating.value.user.trim() &&
         newRating.value.comment.trim() &&
         newRating.value.rating > 0;
});

const selectProgram = (programTitle) => {
  form.value.program = programTitle;
};

const toggleRatingForm = (programId) => {
  if (selectedProgramForRating.value === programId) {
    selectedProgramForRating.value = null;
    resetRatingForm();
  } else {
    selectedProgramForRating.value = programId;
    resetRatingForm();
  }
};

const setRating = (rating) => {
  newRating.value.rating = rating;
};

const resetRatingForm = () => {
  newRating.value = { rating: 0, comment: '', user: '' };
  hoverRating.value = 0;
};

const submitRating = async (programId) => {
  if (!canSubmitRating.value) {
    alert('Please fill in your name, rating, and comment');
    return;
  }

  const db = initdb();
  await addDoc(collection(db, "ratings"), {
    programID: programId,
    user: newRating.value.user,
    rating: newRating.value.rating,
    comment: newRating.value.comment
  });

  resetRatingForm();
  selectedProgramForRating.value = null;
  alert('Thank you for your rating!');
};

const submitRegistration = async () => {
  if (!form.value.name || !form.value.email || !form.value.program) {
    alert('Please fill in required fields: Name, Email, and Program');
    return;
  }

  try {
    // First, save the registration to Firestore
    const db = initdb();
    await addDoc(collection(db, "registrations"), {
      name: form.value.name,
      email: form.value.email,
      country: form.value.country,
      phone: form.value.phone,
      experience: form.value.experience,
      program: form.value.program,
      timestamp: new Date()
    });

    console.log('Registration saved to Firestore');

    // Then call Cloud Function to send confirmation email
    const functionUrl = `https://us-central1-basic-web-application-a7857.cloudfunctions.net/sendRegistrationEmail`;

    console.log('Calling Cloud Function...');

    const resp = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.value.name,
        email: form.value.email,
        program: form.value.program
      })
    });

    console.log('Response status:', resp.status);

    if (!resp.ok) {
      // Try to get more detailed error
      let errorData;
      try {
        errorData = await resp.json();
      } catch {
        errorData = { error: await resp.text() };
      }

      console.error('Cloud Function error details:', errorData);
      alert(`Registration saved, but email failed: ${errorData.error || 'Unknown error'}`);
    } else {
      const result = await resp.json();
      console.log('Email sent successfully:', result);
      alert(`Thank you ${form.value.name}! Registration confirmed and email sent to ${form.value.email}.`);
    }

  } catch (e) {
    console.error('Network error during registration:', e);
    alert('Network error. Registration saved but could not send email.');
  }

  clearForm();
};

const clearForm = () => {
  form.value = {
    name: '',
    email: '',
    country: '',
    phone: '',
    experience: '',
    program: ''
  };
};
</script>

<style scoped>
.resource-page {
  padding: 20px 0;
}

.card {
  margin-bottom: 20px;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.btn {
  margin-right: 10px;
}

.star {
  font-size: 18px;
  color: #ddd;
  transition: color 0.2s;
  margin-right: 1px;
}

.star.filled {
  color: #ffc107;
}

.star.small {
  font-size: 14px;
}

.star.interactive {
  cursor: pointer;
  font-size: 20px;
}

.star.interactive:hover,
.star.hover {
  color: #ffc107;
  transform: scale(1.1);
}

.rating-form {
  border-left: 4px solid #28a745;
}

.reviews-container {
  max-height: 120px;
  overflow-y: auto;
}

.review-item {
  font-size: 0.9rem;
}

.d-flex.gap-2 {
  gap: 0.5rem !important;
}

.rating-input {
  display: inline-block;
}
</style>
