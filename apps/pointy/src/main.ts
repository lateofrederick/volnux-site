import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import PointyWizardApp from './components/PointyWizardApp.vue'
import PointyLandingView from './views/PointyLandingView.vue'
import './styles/app.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'pointy-landing', component: PointyLandingView, meta: { title: 'Pointy-lang — Volnux' } },
    {
      path: '/wizard',
      name: 'pointy-wizard',
      component: PointyWizardApp,
      meta: { title: 'Pointy-lang Wizard — Volnux' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const t = to.meta.title as string | undefined
  if (t) document.title = t
})

createApp(App).use(router).mount('#app')
