import 'bootstrap/dist/css/bootstrap.min.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { initFirebase } from './firebase/init'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
initFirebase();
app.use(router);
app.use(pinia)
app.mount('#app');

// pwd: Zhenjie325!
