<script setup lang="ts">
const marketingUrl = import.meta.env.VITE_MARKETING_URL || 'https://volnux.netlify.app'
const docsUrl = `${marketingUrl.replace(/\/$/, '')}/docs`
</script>

<template>
  <footer class="relative z-[2] border-t border-mesh-border bg-mesh-black/80 py-10 backdrop-blur-md">
    <div class="mesh-container flex flex-col items-center justify-between gap-6 sm:flex-row">
      <p class="order-3 font-mono text-[0.72rem] text-mesh-muted2 sm:order-1">© 2026 Volnux. Built with Pointy-lang.</p>
      <ul class="order-1 flex list-none flex-wrap justify-center gap-8 sm:order-2">
        <li>
          <a class="text-sm text-mesh-muted no-underline transition hover:text-vn-accent" :href="marketingUrl">Home</a>
        </li>
        <li><a :href="docsUrl" class="text-sm text-mesh-muted no-underline transition hover:text-vn-accent">Docs</a></li>
        <li><a href="#" class="text-sm text-mesh-muted no-underline transition hover:text-vn-accent">GitHub</a></li>
        <li><a href="#" class="text-sm text-mesh-muted no-underline transition hover:text-vn-accent">Contact</a></li>
      </ul>
      <p class="order-2 font-mono text-[0.72rem] text-mesh-muted2 sm:order-3">mesh runtime v0.1</p>
    </div>
  </footer>
</template>
