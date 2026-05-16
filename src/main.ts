import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './modules/auth/presentation/stores/auth-store'
import './style.css'
import '../node_modules/preline/css/themes/theme.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
authStore.initializeFromStorage()

app.mount('#app')
