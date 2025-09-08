<template>
  <div class="signup-page">
    <div class="container mt-5">
      <div class="row">
        <div class="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2">
          <h1 class="text-center">Sign Up Form</h1>
          <form @submit.prevent="submitForm">
            <div class="row mb-3">
              <div class="col-6">
                <label for="email" class="form-label">Email Address</label>
                <input type="text" class="form-control" id="email" placeholder="Enter your email address"
                  @blur="() => validateName(true)"
                  @input="() => validateName(false)"
                  v-model="formData.email" />
                  <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
                  <div v-if="errors.message" class="text-danger">{{ errors.message }}</div>
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
            <div class="row mb-3">
              <div class="col-12">
                <label class="form-label mb-3">Select Role</label>
                <div class="role-selection-horizontal">
                  <div class="role-option">
                    <input type="radio" id="user" value="user" v-model="formData.role" class="me-2">
                    <label for="user">User (Standard access)</label>
                  </div>
                  <div class="role-option">
                    <input type="radio" id="admin" value="admin" v-model="formData.role" class="me-2">
                    <label for="admin">Admin (Full access)</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-primary me-2">Submit</button>
              <button type="button" class="btn btn-secondary me-2" @click="clearForm">Clear</button>
            </div>
          </form>

          <div v-if="savedUsers.email != '' && !errors.email && !errors.password && !errors.message" class="mt-4">
            <h5>Confirmed Sign Up:</h5>
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                {{ savedUsers.email }} - Role: {{ savedUsers.role }}
              </li>
            </ul>
            <button type="button" class="btn btn-primary me-2" @click="confirmSignUp">Confirm Signup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { useAuth } from '../functions/role';

const router = useRouter();
const auth = getAuth();
const roleAuth = useAuth();

const formData = ref({
    email: '',
    password: '',
    role: ''
});

const submitForm = () => {
  validateName(true);
  validatePassword(true);

  if (!errors.value.email && !errors.value.password) {
    signup();
  }
};

const confirmSignUp = () => {
  router.push('/login');
}

const signup = () => {
  createUserWithEmailAndPassword(auth, formData.value.email, formData.value.password)
  .then(() => {
    savedUsers.value.email = formData.value.email;
    savedUsers.value.password = formData.value.password;
    savedUsers.value.role = formData.value.role;

    roleAuth.addRole(formData.value.email, formData.value.role);
    alert("Firebase Register Successful!");
  }).catch((error) => {
      if (error.code === "auth/email-already-in-use") {
        errors.value.message = "This email is already registered. Please log in instead.";
      } else if (error.code === "auth/invalid-email") {
        errors.value.message = "The email address is not valid.";
      } else {
        errors.value.message = "Signup failed: " + error.message;
      }
    })
};

const clearForm = () => {
    formData.value = {
      email: '',
      password: '',
      role: ''
    };
    errors.value = {
      email: null,
      password: null,
      message: null
    };
    savedUsers.value = {
      email: '',
      password: '',
      role: ''
    };
};

const errors = ref({
    email: null,
    password: null,
    message: null
});

const validateName = (blur) => {
  if (formData.value.email.length < 3) {
    if (blur) errors.value.email = "Name must be at least 3 characters";
  } else {
    errors.value.email = null;
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

const savedUsers = ref({
    email: '',
    password: '',
    role: ''
});

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

.role-selection-horizontal {
  display: flex;
  gap: 30px;
  justify-content: flex-start;
}

.role-option {
  display: flex;
  align-items: center;
}
</style>
