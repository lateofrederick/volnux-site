import { createApp } from 'vue'
import App from './App.vue'
import './styles/app.css'

document.getElementById('app')?.classList.add('mesh-active')

createApp(App).mount('#app')

document.title = 'Volnux — Mesh Runtime'
