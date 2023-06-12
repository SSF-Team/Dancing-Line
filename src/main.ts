import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'

import '@/assets/css/index.css'

const app = createApp(App)

app.mount('#app')

export default app