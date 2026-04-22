<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { productUrls } from '@/config/product-urls'

const featuresOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const featureLinks = [
  { label: 'Pointy-lang', href: productUrls.pointy, openInNewTab: true },
  { label: 'EventHub', href: productUrls.eventhub, openInNewTab: true },
  { label: 'Mesh Runtime', href: productUrls.mesh, openInNewTab: true },
] as const

function closeFeatures() {
  featuresOpen.value = false
}

function onDocClick(e: MouseEvent) {
  const el = dropdownRef.value
  if (!el?.contains(e.target as Node)) featuresOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <nav class="fixed left-0 right-0 top-0 z-[100] border-b border-vn-border bg-[rgba(8,10,15,0.85)] backdrop-blur-md">
    <div class="mx-auto flex w-full max-w-[1120px] items-center justify-between px-6 py-5 sm:px-8">
      <RouterLink to="/" class="font-display text-xl font-extrabold tracking-[-0.02em] text-vn-white no-underline">
        vol<span class="text-vn-accent">nux</span>
      </RouterLink>

      <ul class="hidden list-none gap-8 lg:flex">
        <li>
          <RouterLink class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text" to="/"
            >Home</RouterLink
          >
        </li>
        <li>
          <RouterLink class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text" to="/about"
            >About</RouterLink
          >
        </li>
        <li ref="dropdownRef" class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-1 text-[0.9rem] font-medium text-vn-muted transition hover:text-vn-text"
            @click.stop="featuresOpen = !featuresOpen"
          >
            Features
            <span class="inline-block text-[0.65rem] transition-transform" :class="featuresOpen ? 'rotate-180' : ''">▾</span>
          </button>
          <ul
            v-if="featuresOpen"
            class="absolute left-0 top-[calc(100%+0.5rem)] z-[200] min-w-[190px] list-none rounded-md border border-vn-border bg-vn-surface2 py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
          >
            <li v-for="feature in featureLinks" :key="feature.label">
              <a
                class="site-header__product-link"
                :href="feature.href"
                :target="feature.openInNewTab ? '_blank' : undefined"
                :rel="feature.openInNewTab ? 'noopener noreferrer' : undefined"
                @click="closeFeatures"
                >{{ feature.label }}</a
              >
            </li>
          </ul>
        </li>
        <li>
          <RouterLink
            class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text"
            to="/governance"
            >Governance</RouterLink
          >
        </li>
        <li>
          <RouterLink class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text" to="/docs"
            >Docs</RouterLink
          >
        </li>
        <li>
          <RouterLink class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text" to="/use-cases"
            >Use Case</RouterLink
          >
        </li>
        <li><a class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text" href="mailto:hello@volnux.ai">Contact Us</a></li>
      </ul>

      <div class="flex items-center gap-2 sm:gap-4 lg:hidden">
        <RouterLink
          to="/"
          class="rounded-md px-2.5 py-2 text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text"
          >Home</RouterLink
        >
        <RouterLink
          to="/docs"
          class="rounded-md px-2.5 py-2 text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text"
          >Docs</RouterLink
        >
      </div>
    </div>
  </nav>
</template>
