<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const productsOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const isMesh = computed(() => route.name === 'mesh-runtime')

const productLinks = [
  { label: 'Pointy-lang', to: '/products/pointy-lang' },
  { label: 'EventHub', to: '/products/eventhub' },
  { label: 'Mesh Runtime', to: '/products/mesh-runtime' },
  { label: 'Changelog', to: '/products/changelog' },
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
    class="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between border-b border-vn-border px-8 py-5 backdrop-blur-md"
    :class="isMesh ? 'border-cyan-500/10 bg-[rgba(5,7,9,0.72)] backdrop-blur-xl lg:px-12' : 'bg-[rgba(8,10,15,0.85)]'"
  >
    <RouterLink
      to="/"
      class="font-display text-xl font-extrabold tracking-[-0.02em] text-vn-white no-underline"
      @click="closeProducts"
    >
      vol<span class="text-vn-accent">nux</span>
    </RouterLink>

    <ul v-if="isMesh" class="hidden list-none gap-8 md:flex">
      <li>
        <RouterLink
          class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text"
          to="/docs"
          @click="closeProducts"
          >Docs</RouterLink
        >
      </li>
      <li><a href="#how" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">How it works</a></li>
      <li>
        <a href="#capabilities" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Capabilities</a>
      </li>
      <li><a href="#dispatch" class="text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text">Dispatch</a></li>
    </ul>
    <ul v-else class="hidden list-none gap-8 lg:flex">
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
        v-if="!isMesh"
        to="/docs"
        class="rounded-md px-2.5 py-2 text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text lg:hidden"
        >Docs</RouterLink
      >
      <RouterLink
        v-else
        to="/docs"
        class="rounded-md px-2.5 py-2 text-sm font-medium text-vn-muted no-underline transition hover:text-vn-text md:hidden"
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
          <li v-for="p in productLinks" :key="p.to">
            <RouterLink
              class="block px-4 py-2 text-sm text-vn-muted no-underline transition hover:bg-vn-accent/[0.06] hover:text-vn-text"
              active-class="!text-vn-text"
              :to="p.to"
              role="menuitem"
              @click="closeProducts"
              >{{ p.label }}</RouterLink
            >
          </li>
        </ul>
      </div>

      <RouterLink
        v-if="!isMesh"
        to="/"
        class="rounded bg-vn-accent px-5 py-2 text-[0.875rem] font-semibold !text-vn-black no-underline transition hover:bg-[#33eaff]"
        >Get Early Access</RouterLink
      >
      <div
        v-else
        class="flex items-center gap-2 rounded-sm border border-emerald-400/20 bg-emerald-400/[0.04] px-3 py-1 font-mono text-[0.7rem] text-vn-accent3"
      >
        <span class="size-1.5 animate-mesh-pulse-ring rounded-full bg-vn-accent3" />
        mesh online
      </div>
    </div>
  </nav>
</template>
