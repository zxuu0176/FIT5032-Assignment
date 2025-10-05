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
app.use(pinia);
app.mount('#app');

// zxuu0176@student.monash.edu
// pwd: Zhenjie325!

// acc: admin@monash.edu
// pwd: Admin1234!

// acc: user@student.monash.edu
// pwd: User1234!
