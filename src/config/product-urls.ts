import { productHref } from '@/config/env-url'

const fallback = {
  pointy: '/products/pointy-lang',
  eventhub: '/products/eventhub',
  mesh: '/products/mesh-runtime',
  changelog: '/products/changelog',
}

export const productUrls = {
  pointy: productHref(import.meta.env.VITE_POINTY_URL, fallback.pointy),
  eventhub: productHref(import.meta.env.VITE_EVENTHUB_URL, fallback.eventhub),
  mesh: productHref(import.meta.env.VITE_MESH_URL, fallback.mesh),
  changelog: productHref(import.meta.env.VITE_CHANGELOG_URL, fallback.changelog),
}
