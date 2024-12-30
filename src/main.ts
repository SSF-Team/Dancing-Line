import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'

import 'vue3-bcui/packages/dist/css/color-light.css'
import 'vue3-bcui/packages/dist/css/index.css'

import '@/assets/css/index.css'

const app = createApp(App)

app.mount('#app')

export default app