<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { productUrls } from '@/config/product-urls'

const productsOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const productLinks = [
  { label: 'Pointy-lang', href: productUrls.pointy, openInNewTab: true },
  { label: 'EventHub', href: productUrls.eventhub, openInNewTab: true },
  { label: 'Mesh Runtime', href: productUrls.mesh, openInNewTab: true },
  { label: 'Changelog', href: productUrls.changelog, openInNewTab: false },
] as const

function closeProducts() {
  productsOpen.value = false
}

function onDocClick(e: MouseEvent) {
  const el = dropdownRef.value
  if (!el?.contains(e.target as Node)) productsOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <nav
    class="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between border-b border-vn-border bg-[rgba(8,10,15,0.85)] px-8 py-5 backdrop-blur-md"
  >
    <RouterLink
      to="/"
      class="font-display text-xl font-extrabold tracking-[-0.02em] text-vn-white no-underline"
      @click="closeProducts"
    >
      vol<span class="text-vn-accent">nux</span>
    </RouterLink>

    <ul class="hidden list-none gap-8 lg:flex">
      <li>
        <RouterLink class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text" to="/docs"
          >Docs</RouterLink
        >
      </li>
      <li>
        <RouterLink
          class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text"
          :to="{ path: '/', hash: '#features' }"
          >Features</RouterLink
        >
      </li>
      <li>
        <RouterLink
          class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text"
          :to="{ path: '/', hash: '#usecases' }"
          >Use Cases</RouterLink
        >
      </li>
      <li>
        <RouterLink
          class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text"
          :to="{ path: '/', hash: '#governance' }"
          >Governance</RouterLink
        >
      </li>
      <li>
        <RouterLink
          class="text-[0.9rem] font-medium text-vn-muted no-underline transition hover:text-vn-text"
          :to="{ path: '/', hash: '#pricing' }"
          >Pricing</RouterLink
        >
      </li>
    </ul>

    <div class="flex items-center gap-2 sm:gap-4">
      <RouterLink
        to="/docs"
        class="rounded-md px-2.5 py-2 text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text lg:hidden"
        >Docs</RouterLink
      >
      <div ref="dropdownRef" class="relative">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded border border-vn-border2 bg-transparent px-3.5 py-2 font-sans text-[0.9rem] font-medium text-vn-muted transition hover:border-vn-accent hover:text-vn-text"
          @click.stop="productsOpen = !productsOpen"
        >
          Products
          <span class="inline-block text-[0.65rem] transition-transform" :class="productsOpen ? 'rotate-180' : ''" aria-hidden="true">▾</span>
        </button>
        <ul
          v-if="productsOpen"
          class="absolute right-0 top-[calc(100%+0.5rem)] z-[200] min-w-[200px] list-none rounded-md border border-vn-border bg-vn-surface2 py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
          role="menu"
        >
          <li v-for="p in productLinks" :key="p.label">
            <a
              class="site-header__product-link"
              :href="p.href"
              :target="p.openInNewTab ? '_blank' : undefined"
              :rel="p.openInNewTab ? 'noopener noreferrer' : undefined"
              role="menuitem"
              @click="closeProducts"
              >{{ p.label }}</a
            >
          </li>
        </ul>
      </div>

      <RouterLink
        to="/"
        class="rounded bg-vn-accent px-5 py-2 text-[0.875rem] font-semibold !text-vn-black no-underline transition hover:bg-[#33eaff]"
        >Get Early Access</RouterLink
      >
    </div>
  </nav>
</template>
