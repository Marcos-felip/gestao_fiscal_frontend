import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './modules/auth/presentation/stores/auth-store'
import { usePermissionsStore } from './modules/permissions/presentation/stores/permissions-store'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
authStore.initializeFromStorage()

if (authStore.isAuthenticated) {
  void usePermissionsStore(pinia).load()
}

app.mount('#app')
