import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL
// import Echo from 'laravel-echo';

// window.Pusher = require('pusher-js');

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.VUE_APP_WEBSOCKETS_KEY,
//     wsHost: process.env.VUE_APP_WEBSOCKETS_SERVER,
//     wsPort: 6001,
//     forceTLS: false,
//     disableStats: true
// });

createApp(App).use(store).use(router).mount('#app')
