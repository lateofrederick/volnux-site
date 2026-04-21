<script setup lang="ts">
const marketingUrl = import.meta.env.VITE_MARKETING_URL || 'https://volnux.netlify.app'
const docsUrl = `${marketingUrl.replace(/\/$/, '')}/docs`
const homeUrl = marketingUrl.replace(/\/$/, '')
const aboutUrl = `${homeUrl}/#problem`
const featuresUrl = `${homeUrl}/#features`
const governanceUrl = `${homeUrl}/#governance`
</script>

<template>
  <footer class="relative z-[2] border-t border-mesh-border bg-mesh-black/80 py-10 backdrop-blur-md">
    <div class="mesh-container flex flex-col items-center justify-between gap-6 sm:flex-row">
      <p class="order-3 font-mono text-[0.72rem] text-mesh-muted2 sm:order-1">© 2026 Volnux. Built with Pointy-lang.</p>
      <ul class="order-1 flex list-none flex-wrap justify-center gap-8 sm:order-2">
        <li>
          <a class="text-sm text-mesh-muted no-underline transition hover:text-vn-accent" :href="homeUrl">Home</a>
        </li>
        <li><a :href="aboutUrl" class="text-sm text-mesh-muted no-underline transition hover:text-vn-accent">About</a></li>
        <li><a :href="featuresUrl" class="text-sm text-mesh-muted no-underline transition hover:text-vn-accent">Features</a></li>
        <li><a :href="governanceUrl" class="text-sm text-mesh-muted no-underline transition hover:text-vn-accent">Governance</a></li>
        <li><a :href="docsUrl" class="text-sm text-mesh-muted no-underline transition hover:text-vn-accent">Docs</a></li>
        <li><a href="mailto:hello@volnux.ai" class="text-sm text-mesh-muted no-underline transition hover:text-vn-accent">Contact Us</a></li>
      </ul>
      <p class="order-2 font-mono text-[0.72rem] text-mesh-muted2 sm:order-3">mesh runtime v0.1</p>
    </div>
  </footer>
</template>
