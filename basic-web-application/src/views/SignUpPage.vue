<template>
  <div class="signup-page">
    <div class="container mt-5">
      <div class="row">
        <div class="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2">
          <h1 class="text-center">Sign Up Form</h1>
          <form @submit.prevent="submitForm">
            <div class="row mb-3">
              <div class="col-6">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" placeholder="Enter your username"
                  @blur="() => validateName(true)"
                  @input="() => validateName(false)"
                  v-model="formData.username" />
                  <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
              </div>
              <div class="col-6">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Enter your password"
                  @blur="() => validatePassword(true)"
                  @input="() => validatePassword(false)"
                  v-model="formData.password" />
                  <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
              </div>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-primary me-2">Submit</button>
              <button type="button" class="btn btn-secondary me-2" @click="clearForm">Clear</button>
              <button type="button" class="btn btn-secondary" @click="clearStorage">Clear Storage</button>
            </div>
          </form>

          <div v-if="savedUsers.length > 0" class="mt-4">
            <h5>Saved Users:</h5>
            <ul class="list-group">
              <li v-for="user in savedUsers" :key="user.id" class="list-group-item d-flex justify-content-between align-items-center">
                {{ user.username }}
                <small class="text-muted">{{ formatDate(user.timestamp) }}</small>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const formData = ref({
    username: '',
    password: ''
});

const submitForm = () => {
  validateName(true);
  validatePassword(true);

  if (!errors.value.username && !errors.value.password) {
    saveToLocalStorage();
  }
};

const clearForm = () => {
    formData.value = {
      username: '',
      password: ''
    };
    errors.value = {
      username: null,
      password: null
    };
};

const errors = ref({
    username: null,
    password: null
});

const validateName = (blur) => {
  if (formData.value.username.length < 3) {
    if (blur) errors.value.username = "Name must be at least 3 characters";
  } else {
    errors.value.username = null;
  }
};

const validatePassword = (blur) => {
  const password = formData. value.password;
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(), .? ":{}|<>]/.test(password);

  if (password.length < minLength) {
    if (blur) errors. value.password = `Password must be at least ${minLength} characters long .`;
  } else if (!hasUppercase) {
    if (blur) errors. value.password = "Password must contain at least one uppercase letter.";
  } else if (!hasLowercase) {
    if (blur) errors.value.password = "Password must contain at least one lowercase letter.";
  } else if (!hasNumber) {
    if (blur) errors.value.password = "Password must contain at least one number.";
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = "Password must contain at least one special character.";
  } else {
    errors.value. password = null;
  }
};

const savedUsers = ref([]);

onMounted(() => {
  loadSavedUsers();
});

const saveToLocalStorage = () => {
  try {
    const existingUsers = JSON.parse(localStorage.getItem('usernames') || '[]');

    if (existingUsers.some(user => user.username === formData.value.username)) {
      alert('Username already exists!');
      return;
    }

    const newUser = {
      id: Date.now(),
      username: formData.value.username,
      password: formData.value.password,
      timestamp: new Date().toISOString()
    };

    existingUsers.push(newUser);
    localStorage.setItem('usernames', JSON.stringify(existingUsers));

    loadSavedUsers();

    clearForm();
    alert('User registered and saved successfully!');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    alert('Error saving user data');
  }
};

const loadSavedUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem('usernames') || '[]');
    savedUsers.value = users;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    savedUsers.value = [];
  }
};

// const loadFromStorage = () => {
//   try {
//     const users = JSON.parse(localStorage.getItem('usernames') || '[]');
//     if (users.length > 0) {
//       const lastUser = users[users.length - 1];
//       formData.value.username = lastUser.username;
//       formData.value.password = lastUser.password;
//     } else {
//       alert('No saved users found');
//     }
//   } catch (error) {
//     console.error('Error loading from localStorage:', error);
//     alert('Error loading user data');
//   }
// };

const clearStorage = () => {
  if (confirm('Are you sure you want to clear all saved users?')) {
    localStorage.removeItem('usernames');
    savedUsers.value = [];
    alert('Storage cleared successfully');
  }
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};
</script>

<style scoped>
.signup-page {
  width: 100%;
}

.signup-page .col-12 {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 30px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
