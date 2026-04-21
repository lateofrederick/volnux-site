<script setup lang="ts">
const marketingUrl = import.meta.env.VITE_MARKETING_URL || 'https://volnux.netlify.app'
const docsUrl = `${marketingUrl.replace(/\/$/, '')}/docs`
const homeUrl = marketingUrl.replace(/\/$/, '')
const aboutUrl = `${homeUrl}/#problem`
const featuresUrl = `${homeUrl}/#features`
const governanceUrl = `${homeUrl}/#governance`
const useCaseUrl = `${homeUrl}/#usecases`
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
      <li><a :href="homeUrl" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Home</a></li>
      <li><a :href="aboutUrl" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">About</a></li>
      <li><a :href="featuresUrl" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Features</a></li>
      <li>
        <a :href="governanceUrl" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Governance</a>
      </li>
      <li><a :href="docsUrl" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Docs</a></li>
      <li><a :href="useCaseUrl" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Use Case</a></li>
      <li><a href="mailto:hello@volnux.ai" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Contact Us</a></li>
    </ul>

    <div class="flex items-center gap-2 sm:gap-4">
      <a
        :href="docsUrl"
        class="rounded-md px-2.5 py-2 text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text md:hidden"
        >Docs</a
      >
      <a
        href="mailto:hello@volnux.ai"
        class="rounded-sm border border-vn-border2 px-3 py-1 font-mono text-[0.72rem] text-vn-muted no-underline transition hover:border-vn-accent hover:text-vn-text"
      >
        Contact Us
      </a>
    </div>
  </nav>
</template>
