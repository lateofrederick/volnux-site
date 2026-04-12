import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MeshRuntimeView from '@/views/MeshRuntimeView.vue'
import ProductPlaceholderView from '@/views/ProductPlaceholderView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Volnux — The Workflow Operating System' } },
  {
    path: '/products/mesh-runtime',
    name: 'mesh-runtime',
    component: MeshRuntimeView,
    meta: { title: 'Volnux — Mesh Runtime' },
  },
  {
    path: '/products/pointy-lang',
    name: 'product-pointy-lang',
    component: ProductPlaceholderView,
    props: { title: 'Pointy-lang', blurb: 'Declarative workflow language built for humans.' },
    meta: { title: 'Pointy-lang — Volnux' },
  },
  {
    path: '/products/eventhub',
    name: 'product-eventhub',
    component: ProductPlaceholderView,
    props: { title: 'EventHub', blurb: 'Registry and discovery for EventBase components.' },
    meta: { title: 'EventHub — Volnux' },
  },
  {
    path: '/products/changelog',
    name: 'product-changelog',
    component: ProductPlaceholderView,
    props: { title: 'Changelog', blurb: 'Release history and migration notes.' },
    meta: { title: 'Changelog — Volnux' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const t = to.meta.title as string | undefined
  if (t) document.title = t
})

export default router
