<script setup lang="ts">
const marketingUrl = import.meta.env.VITE_MARKETING_URL || 'https://volnux.netlify.app'
const docsUrl = `${marketingUrl.replace(/\/$/, '')}/docs`
</script>

<template>
  <nav
    class="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between border-b border-cyan-500/10 bg-[rgba(5,7,9,0.72)] px-8 py-5 backdrop-blur-xl lg:px-12"
  >
    <a
      :href="marketingUrl"
      class="font-display text-xl font-extrabold tracking-[-0.02em] text-vn-white no-underline"
    >
      vol<span class="text-vn-accent">nux</span>
    </a>

    <ul class="hidden list-none gap-8 md:flex">
      <li>
        <a :href="docsUrl" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Docs</a>
      </li>
      <li><a href="#how" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">How it works</a></li>
      <li>
        <a href="#capabilities" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Capabilities</a>
      </li>
      <li><a href="#dispatch" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Dispatch</a></li>
    </ul>

    <div class="flex items-center gap-2 sm:gap-4">
      <a
        :href="docsUrl"
        class="rounded-md px-2.5 py-2 text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text md:hidden"
        >Docs</a
      >
      <div class="flex items-center gap-2 rounded-sm border border-emerald-400/20 bg-emerald-400/[0.04] px-3 py-1 font-mono text-[0.7rem] text-vn-accent3">
        <span class="size-1.5 animate-mesh-pulse-ring rounded-full bg-vn-accent3" />
        mesh online
      </div>
    </div>
  </nav>
</template>
