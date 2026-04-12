<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  blurb: string
}>()
</script>

<template>
  <main class="min-h-[60vh] px-6 pb-24 pt-40 sm:px-8">
    <div class="mx-auto w-full max-w-xl">
      <p class="mb-4 font-mono text-[0.75rem] font-medium uppercase tracking-[0.12em] text-vn-accent">Product</p>
      <h1 class="mb-4 font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-tight text-vn-white">{{ title }}</h1>
      <p class="mb-8 text-lg leading-relaxed text-vn-muted">{{ blurb }}</p>
      <p class="text-[0.95rem] leading-relaxed text-vn-muted2">
        Full product page coming soon. Explore the
        <RouterLink class="text-vn-accent no-underline hover:underline" to="/">homepage</RouterLink>
        or the
        <RouterLink class="text-vn-accent no-underline hover:underline" to="/products/mesh-runtime">Mesh Runtime</RouterLink>
        experience.
      </p>
    </div>
  </main>
</template>
