<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const marketingUrl = import.meta.env.VITE_MARKETING_URL?.trim() || 'https://volnux.netlify.app'
const marketingDocsUrl = `${marketingUrl.replace(/\/$/, '')}/docs`
</script>

<template>
  <div id="eh-root">
    <nav class="z1">
      <RouterLink to="/" class="nav-brand">
        <svg class="nav-logo-mark" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <circle cx="13" cy="13" r="13" fill="#0d0f14" />
          <path d="M 13 13 L 13 2  A 11 11 0 0 1 21.5 16.5 Z" fill="#00c8e0" />
          <path d="M 13 13 L 21.5 16.5 A 11 11 0 0 1 4.5 16.5 Z" fill="#6b4fff" />
          <path d="M 13 13 L 4.5 16.5 A 11 11 0 0 1 13 2   Z" fill="#00e87a" />
          <path
            d="M 10 3.5 C 9 6 8.8 9 9.2 13 A 3.8 3.8 0 0 0 13 16.8 A 3.8 3.8 0 0 0 16.8 13 C 17.2 9 17 6 16 3.5 C 15.5 2.8 10.5 2.8 10 3.5 Z"
            fill="#0d0f14"
          />
          <path
            d="M 4 15 C 6 12.5 9 11 12.8 10.2 A 3.8 3.8 0 0 0 11.3 8 A 3.8 3.8 0 0 0 9.2 7.2 C 6 8 4 10 3 12.5 C 2.7 13.2 2.8 15.5 4 15 Z"
            fill="#0d0f14"
          />
          <path
            d="M 22 15 C 20 12.5 17 11 13.2 10.2 A 3.8 3.8 0 0 0 14.7 8 A 3.8 3.8 0 0 0 16.8 7.2 C 20 8 22 10 23 12.5 C 23.3 13.2 23.2 15.5 22 15 Z"
            fill="#0d0f14"
          />
          <circle cx="13" cy="13" r="2.5" fill="#0d0f14" />
          <circle cx="13" cy="13" r="1.2" fill="#00e5ff" />
        </svg>
        <span class="nav-volnux">vol<span>nux</span></span>
      </RouterLink>
      <div class="eh-nav-product">
        <span class="nav-sep" style="margin: 0"></span>
        <span class="nav-product"><strong>EventHub</strong></span>
      </div>
      <div class="nav-right">
        <RouterLink to="/#registry" class="nav-link">Browse</RouterLink>
        <RouterLink to="/#publish" class="nav-link">Publish</RouterLink>
        <RouterLink to="/#how" class="nav-link">How it works</RouterLink>
        <a :href="marketingDocsUrl" class="nav-link" target="_blank" rel="noopener noreferrer">Docs</a>
        <a href="#" class="nav-link nav-link--cta">Publish Event →</a>
      </div>
    </nav>
    <a class="eh-marketing-only" :href="marketingUrl">Marketing site</a>
    <RouterView />
  </div>
</template>

<style scoped>
#eh-root {
  position: relative;
}

.eh-nav-product {
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  height: 100%;
  border-right: 1px solid var(--rule);
}

.eh-marketing-only {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 250;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  color: var(--fog2);
  text-decoration: none;
  transition: color 0.2s;
}

.eh-marketing-only:hover {
  color: var(--cyan);
}

/* Leave room so “Marketing site” does not overlap Publish CTA in nav */
.nav-right {
  padding-right: 7rem;
}
</style>
