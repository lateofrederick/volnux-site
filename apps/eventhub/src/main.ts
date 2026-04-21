import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import EventHubHomeView from './views/EventHubHomeView.vue'
import EventDetailView from './views/EventDetailView.vue'
import EventHubLandingView from './views/EventHubLandingView.vue'
import './styles/app.css'
import 'highlight.js/styles/atom-one-dark.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'eventhub-landing', component: EventHubLandingView, meta: { title: 'EventHub — Volnux' } },
    {
      path: '/browse',
      name: 'eventhub-browse',
      component: EventHubHomeView,
      meta: { title: 'Browse — EventHub — Volnux' },
    },
    {
      path: '/events/:slug',
      name: 'eventhub-detail',
      component: EventDetailView,
      meta: { title: 'Event detail — EventHub — Volnux' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const t = to.meta.title as string | undefined
  if (t) document.title = t
})

createApp(App).use(router).mount('#app')
