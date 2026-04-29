import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import GovernanceView from '@/views/GovernanceView.vue'
import UseCasesView from '@/views/UseCasesView.vue'
import MeshExternalView from '@/views/MeshExternalView.vue'
import ProductPlaceholderView from '@/views/ProductPlaceholderView.vue'
import EventHubExternalView from '@/views/EventHubExternalView.vue'
import PointyExternalView from '@/views/PointyExternalView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Volnux — The Workflow Operating System' } },
  {
    path: '/docs',
    name: 'docs',
    component: () => import('@/views/DocsView.vue'),
    meta: { title: 'Documentation — Volnux' },
  },
  {
    path: '/products/mesh-runtime',
    name: 'mesh-runtime',
    component: MeshExternalView,
    meta: { title: 'Volnux — Mesh Runtime' },
  },
  {
    path: '/products/pointy-lang',
    name: 'product-pointy-lang',
    component: PointyExternalView,
    meta: { title: 'Pointy-lang — Volnux' },
  },
  {
    path: '/products/eventhub',
    name: 'product-eventhub',
    component: EventHubExternalView,
    meta: { title: 'EventHub — Volnux' },
  },
  {
    path: '/products/eventhub/events/:slug',
    name: 'eventhub-event-detail',
    component: EventHubExternalView,
    meta: { title: 'Event detail — EventHub — Volnux' },
  },
  {
    path: '/products/changelog',
    name: 'product-changelog',
    component: ProductPlaceholderView,
    props: { title: 'Changelog', blurb: 'Release history and migration notes.' },
    meta: { title: 'Changelog — Volnux' },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { title: 'About — Volnux' },
  },
  {
    path: '/governance',
    name: 'governance',
    component: GovernanceView,
    meta: { title: 'Governance — Volnux' },
  },
  {
    path: '/use-cases',
    name: 'use-cases',
    component: UseCasesView,
    meta: { title: 'Use Cases — Volnux' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    // /docs hashes are section ids for the app router, not in-page anchors — always start at top.
    if (to.name === 'docs') return { top: 0, left: 0 }
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, left: 0 }
  },
})

router.afterEach((to) => {
  const t = to.meta.title as string | undefined
  if (t) document.title = t
})

export default router
