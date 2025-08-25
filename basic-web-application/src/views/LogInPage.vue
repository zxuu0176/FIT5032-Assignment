<template>
  <div class="login-page">
    <h1>Log In</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="username"
        />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        />
      </div>
      <button type="submit">Log In</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: "LogInPage",
  data() {
    return {
      email: "",
      password: "",
      error: "",
    };
  },
  methods: {
    handleLogin() {
      // Replace with real authentication logic
      if (this.email === "user@example.com" && this.password === "password") {
        this.error = "";
        // Redirect or emit event on successful login
        this.$router.push({ name: "Home" });
      } else {
        this.error = "Invalid email or password.";
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 40px auto;
  padding: 2rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.25rem;
}
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 0.75rem;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
}
.error {
  color: #d32f2f;
  margin-top: 1rem;
  text-align: center;
}
</style>
