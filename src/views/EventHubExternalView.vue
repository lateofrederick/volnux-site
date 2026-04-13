<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { parseViteExternalUrl } from '@/config/env-url'

const route = useRoute()

const base = computed(() => parseViteExternalUrl(import.meta.env.VITE_EVENTHUB_URL))

const targetUrl = computed(() => {
  const b = base.value
  if (!b) return null
  if (route.name === 'eventhub-event-detail' && route.params.slug) {
    return `${b}/events/${route.params.slug}`
  }
  return `${b}/`
})

onMounted(() => {
  const url = targetUrl.value
  if (url) window.location.replace(url)
})
</script>

<template>
  <main v-if="!base" class="vn-section">
    <div class="vn-container max-w-2xl py-16">
      <h1 class="vn-section-title">EventHub</h1>
      <p class="vn-section-sub text-vn-muted">
        EventHub is built and deployed as a separate app in this monorepo. Run
        <code class="rounded border border-vn-border2 bg-vn-black/60 px-1.5 py-0.5 font-mono text-sm text-vn-accent3">npm run dev:eventhub</code>
        for local development, or configure
        <code class="rounded border border-vn-border2 bg-vn-black/60 px-1.5 py-0.5 font-mono text-sm text-vn-accent3">VITE_EVENTHUB_URL</code>
        on the marketing site so visitors are sent to the deployed EventHub.
      </p>
    </div>
  </main>
  <main v-else class="vn-section text-vn-muted">
    <div class="vn-container py-16">
      <p class="font-mono text-sm">Redirecting to EventHub…</p>
    </div>
  </main>
</template>
