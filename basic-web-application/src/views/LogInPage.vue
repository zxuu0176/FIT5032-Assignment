<template>
  <div class="login-page">
    <div class="container mt-5">
      <div class="row">
        <div class="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2">
          <h1 class="text-center">User Information Form</h1>
          <div v-if="errors.message" class="text-danger">{{ errors.message }}</div>
          <form @submit.prevent="submitForm">
            <div class="row mb-3">
              <div class="col-6">
                <label for="email" class="form-label">Email Address</label>
                <input type="text" class="form-control" id="email" placeholder="Enter your email address"
                  @blur="() => validateEmail(true)"
                  @input="() => validateEmail(false)"
                  v-model="formData.email" />
                  <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
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
              <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
            </div>
          </form>
          <router-link to="/signup">New member? Sign up</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = getAuth();

const formData = ref({
    email: '',
    password: ''
});

const submitForm = () => {
  validateEmail(true);
  validatePassword(true);

  if (!errors.value.email && !errors.value.password) {
    login();
  }
};

const login = () => {
  signInWithEmailAndPassword(auth, formData.value.email, formData.value.password)
  .then((userCredential) => {
    const user = userCredential.user;
    alert("Login Successful! Welcome " + (user.email));
    router.push("/");
  }).catch((error) => {
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        errors.value.message = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errors.value.message = "Incorrect password.";
      } else if (error.code === "auth/missing-email" || error.code === "auth/invalid-email") {
        errors.value.message = "Invalid email format.";
      } else {
        errors.value.message = "Login failed: " + error.message;
      }
      console.log(error.code);
      // clearWrongForm();
    })
};

const clearForm = () => {
    formData.value = {
      email: '',
      password: ''
    };
    errors.value = {
      email: null,
      password: null,
      message: null
    };
};

// const clearWrongForm = () => {
//     formData.value = {
//       email: '',
//       password: ''
//     };
// };

const errors = ref({
    email: null,
    password: null,
    message: null
});

const validateEmail = (blur) => {
  if (formData.value.email.length < 3) {
    if (blur) errors.value.email = "Email must be at least 3 characters";
  } else {
    errors.value.email = null;
  }
};

const validatePassword = (blur) => {
  const password = formData.value.password;
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
    errors.value.password = null;
  }
};
</script>

<style scoped>
.login-page {
  width: 100%;
}

.login-page .col-12 {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 30px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
