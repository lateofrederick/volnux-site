<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { parseViteExternalUrl } from '@/config/env-url'

const base = computed(() => parseViteExternalUrl(import.meta.env.VITE_MESH_URL))

onMounted(() => {
  const b = base.value
  if (b) window.location.replace(`${b}/`)
})
</script>

<template>
  <main v-if="!base" class="vn-section">
    <div class="vn-container max-w-2xl py-16">
      <h1 class="vn-section-title">Mesh Runtime</h1>
      <p class="vn-section-sub text-vn-muted">
        The Mesh Runtime page lives in
        <code class="rounded border border-vn-border2 bg-vn-black/60 px-1.5 py-0.5 font-mono text-sm text-vn-accent3">apps/mesh-runtime</code>
        . Run
        <code class="rounded border border-vn-border2 bg-vn-black/60 px-1.5 py-0.5 font-mono text-sm text-vn-accent3">npm run dev:mesh</code>
        locally, or set
        <code class="rounded border border-vn-border2 bg-vn-black/60 px-1.5 py-0.5 font-mono text-sm text-vn-accent3">VITE_MESH_URL</code>
        on the marketing site to redirect here.
      </p>
    </div>
  </main>
  <main v-else class="vn-section text-vn-muted">
    <div class="vn-container py-16">
      <p class="font-mono text-sm">Redirecting to Mesh Runtime…</p>
    </div>
  </main>
</template>
