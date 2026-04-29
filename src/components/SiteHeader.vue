<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const featuresOpen = ref(false)
const mobileOpen = ref(false)
const mobileFeaturesSub = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const featureLinks = [
  { label: 'Pointy-lang', to: '/products/pointy-lang' },
  { label: 'EventHub', to: '/products/eventhub' },
  { label: 'Mesh Runtime', to: '/products/mesh-runtime' },
] as const

function closeFeatures() {
  featuresOpen.value = false
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
  if (!mobileOpen.value) mobileFeaturesSub.value = false
  document.body.style.overflow = mobileOpen.value ? 'hidden' : ''
}

function closeMobile() {
  mobileOpen.value = false
  mobileFeaturesSub.value = false
  document.body.style.overflow = ''
}

function onDocClick(e: MouseEvent) {
  const el = dropdownRef.value
  if (!el?.contains(e.target as Node)) featuresOpen.value = false
}

// Auto-close mobile nav on route change
watch(() => route.fullPath, () => closeMobile())

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.body.style.overflow = ''
})
</script>

<template>
  <nav class="fixed left-0 right-0 top-0 z-50 border-b border-vn-border bg-vn-black/90 backdrop-blur-md">
    <div class="vn-container flex items-center justify-between py-4">
      <!-- Logo -->
      <RouterLink to="/" class="font-display text-lg font-bold tracking-tight text-vn-white transition-colors hover:text-vn-accent sm:text-xl">
        vol<span class="text-vn-accent">nux</span>
      </RouterLink>

      <!-- Desktop nav -->
      <ul class="hidden items-center gap-6 lg:flex">
        <li>
          <RouterLink class="text-sm font-medium text-vn-muted transition-colors hover:text-vn-text" to="/">Home</RouterLink>
        </li>
        <li>
          <RouterLink class="text-sm font-medium text-vn-muted transition-colors hover:text-vn-text" to="/about">About</RouterLink>
        </li>
        <li ref="dropdownRef" class="relative">
          <button
            type="button"
            class="flex items-center gap-1 text-sm font-medium text-vn-muted transition-colors hover:text-vn-text"
            @click.stop="featuresOpen = !featuresOpen"
          >
            Features
            <svg class="h-3 w-3 transition-transform" :class="featuresOpen ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 12 12">
              <path d="M6 8L1 3h10L6 8z" />
            </svg>
          </button>
          <Transition name="dropdown">
            <ul
              v-if="featuresOpen"
              class="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-lg border border-vn-border bg-vn-surface2 py-1 shadow-xl"
            >
<li v-for="feature in featureLinks" :key="feature.label">
              <RouterLink
                class="site-header__product-link block px-4 py-2 text-sm text-vn-muted transition-colors hover:bg-vn-surface hover:text-vn-text"
                :to="feature.to"
                @click="closeFeatures"
              >
                {{ feature.label }}
              </RouterLink>
            </li>
            </ul>
          </Transition>
        </li>
        <li>
          <RouterLink class="text-sm font-medium text-vn-muted transition-colors hover:text-vn-text" to="/governance">Governance</RouterLink>
        </li>
        <li>
          <RouterLink class="text-sm font-medium text-vn-muted transition-colors hover:text-vn-text" to="/docs">Docs</RouterLink>
        </li>
        <li>
          <RouterLink class="text-sm font-medium text-vn-muted transition-colors hover:text-vn-text" to="/use-cases">Use Cases</RouterLink>
        </li>
        <li>
          <a class="text-sm font-medium text-vn-muted transition-colors hover:text-vn-text" href="mailto:hello@volnux.ai">Contact</a>
        </li>
      </ul>

      <!-- Mobile hamburger -->
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-md border border-vn-border text-vn-muted transition-colors hover:border-vn-accent hover:text-vn-accent lg:hidden"
        aria-label="Toggle navigation menu"
        @click="toggleMobile"
      >
        <span class="flex flex-col items-center justify-center gap-1.5">
          <span
            class="block h-0.5 w-5 rounded-full bg-current transition-transform duration-300"
            :class="mobileOpen ? 'translate-y-2 rotate-45' : ''"
          />
          <span
            class="block h-0.5 w-5 rounded-full bg-current transition-opacity duration-200"
            :class="mobileOpen ? 'opacity-0' : 'opacity-100'"
          />
          <span
            class="block h-0.5 w-5 rounded-full bg-current transition-transform duration-300"
            :class="mobileOpen ? '-translate-y-2 -rotate-45' : ''"
          />
        </span>
      </button>
    </div>
  </nav>

  <!-- Mobile nav overlay -->
  <Transition name="mobile-nav">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 flex flex-col bg-vn-black/98 backdrop-blur-xl lg:hidden"
    >
      <!-- Spacer for fixed navbar -->
      <div class="h-16 shrink-0" />

      <div class="flex flex-1 flex-col overflow-y-auto px-4 pb-8 pt-4">
        <ul class="flex flex-col gap-1">
          <li>
            <RouterLink
              to="/"
              class="block rounded-lg px-4 py-3 text-base font-medium text-vn-text transition-colors hover:bg-vn-surface hover:text-vn-accent"
              @click="closeMobile"
            >Home</RouterLink>
          </li>
          <li>
            <RouterLink
              to="/about"
              class="block rounded-lg px-4 py-3 text-base font-medium text-vn-text transition-colors hover:bg-vn-surface hover:text-vn-accent"
              @click="closeMobile"
            >About</RouterLink>
          </li>
          <li>
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base font-medium text-vn-text transition-colors hover:bg-vn-surface hover:text-vn-accent"
              @click="mobileFeaturesSub = !mobileFeaturesSub"
            >
              Features
              <svg class="h-4 w-4 text-vn-muted transition-transform" :class="mobileFeaturesSub ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 12 12">
                <path d="M6 8L1 3h10L6 8z" />
              </svg>
            </button>
            <Transition name="sub-expand">
              <ul v-if="mobileFeaturesSub" class="ml-4 mt-1 flex flex-col gap-0.5 border-l border-vn-border pl-4">
                <li v-for="feature in featureLinks" :key="feature.label">
                  <RouterLink
                    :to="feature.to"
                    class="block rounded-md px-3 py-2 text-sm text-vn-muted transition-colors hover:bg-vn-surface hover:text-vn-text"
                    @click="closeMobile"
                  >
                    {{ feature.label }}
                  </RouterLink>
                </li>
              </ul>
            </Transition>
          </li>
          <li>
            <RouterLink
              to="/governance"
              class="block rounded-lg px-4 py-3 text-base font-medium text-vn-text transition-colors hover:bg-vn-surface hover:text-vn-accent"
              @click="closeMobile"
            >Governance</RouterLink>
          </li>
          <li>
            <RouterLink
              to="/docs"
              class="block rounded-lg px-4 py-3 text-base font-medium text-vn-text transition-colors hover:bg-vn-surface hover:text-vn-accent"
              @click="closeMobile"
            >Docs</RouterLink>
          </li>
          <li>
            <RouterLink
              to="/use-cases"
              class="block rounded-lg px-4 py-3 text-base font-medium text-vn-text transition-colors hover:bg-vn-surface hover:text-vn-accent"
              @click="closeMobile"
            >Use Cases</RouterLink>
          </li>
          <li>
            <a
              href="mailto:hello@volnux.ai"
              class="block rounded-lg px-4 py-3 text-base font-medium text-vn-text transition-colors hover:bg-vn-surface hover:text-vn-accent"
              @click="closeMobile"
            >Contact Us</a>
          </li>
        </ul>

        <!-- CTA at bottom -->
        <div class="mt-auto pt-6">
          <RouterLink
            to="/"
            class="vn-btn-primary flex w-full justify-center"
            @click="closeMobile"
          >
            Get Early Access
          </RouterLink>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Mobile nav overlay transitions */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity 0.2s ease;
}
.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
}

/* Features sub-menu expand */
.sub-expand-enter-active,
.sub-expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  overflow: hidden;
  max-height: 200px;
}
.sub-expand-enter-from,
.sub-expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
