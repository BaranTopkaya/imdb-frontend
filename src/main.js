import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n' // i18n dosyasını import et

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n) // i18n'i uygulamaya ekle

app.mount('#app')