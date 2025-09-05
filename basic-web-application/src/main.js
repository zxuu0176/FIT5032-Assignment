import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { initFirebase } from './firebase/init'
import App from './App.vue'
import router from './router'

const app = createApp(App)
initFirebase();
app.use(router);
app.mount('#app');
