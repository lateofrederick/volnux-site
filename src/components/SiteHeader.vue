<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { productUrls } from '@/config/product-urls'

const route = useRoute()

const featuresOpen = ref(false)
const mobileOpen = ref(false)
const mobileFeaturesSub = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const featureLinks = [
  { label: 'Pointy-lang', href: productUrls.pointy, openInNewTab: true },
  { label: 'EventHub', href: productUrls.eventhub, openInNewTab: true },
  { label: 'Mesh Runtime', href: productUrls.mesh, openInNewTab: true },
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
  <nav class="fixed left-0 right-0 top-0 z-[100] border-b border-vn-border bg-[rgba(8,10,15,0.85)] backdrop-blur-md">
    <div class="mx-auto flex w-full max-w-[1120px] items-center justify-between px-6 py-5 sm:px-8">
      <RouterLink to="/" class="font-display text-xl font-extrabold tracking-[-0.02em] text-vn-white no-underline">
        vol<span class="text-vn-accent">nux</span>
      </RouterLink>

      <!-- Desktop nav -->
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

      <!-- Hamburger button (mobile / tablet) -->
      <button
        type="button"
        class="relative z-[201] flex size-10 items-center justify-center rounded-md border border-vn-border text-vn-muted transition hover:border-vn-accent hover:text-vn-accent lg:hidden"
        aria-label="Toggle navigation menu"
        @click="toggleMobile"
      >
        <!-- Animated hamburger icon -->
        <span class="flex flex-col items-center justify-center gap-[5px]">
          <span
            class="block h-[2px] w-5 rounded-full bg-current transition-transform duration-300"
            :class="mobileOpen ? 'translate-y-[7px] rotate-45' : ''"
          />
          <span
            class="block h-[2px] w-5 rounded-full bg-current transition-opacity duration-200"
            :class="mobileOpen ? 'opacity-0' : 'opacity-100'"
          />
          <span
            class="block h-[2px] w-5 rounded-full bg-current transition-transform duration-300"
            :class="mobileOpen ? '-translate-y-[7px] -rotate-45' : ''"
          />
        </span>
      </button>
    </div>
  </nav>

  <!-- Mobile nav overlay -->
  <Transition name="mobile-nav">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-[150] flex flex-col bg-vn-black/98 backdrop-blur-xl lg:hidden"
    >
      <!-- Spacer for the fixed navbar -->
      <div class="h-[72px] shrink-0" />

      <div class="flex flex-1 flex-col overflow-y-auto px-6 pb-10 pt-6 sm:px-8">
        <ul class="flex flex-col gap-1 text-lg">
          <li>
            <RouterLink
              to="/"
              class="block rounded-lg px-4 py-3 font-medium text-vn-text no-underline transition hover:bg-vn-surface2 hover:text-vn-accent"
              @click="closeMobile"
            >Home</RouterLink>
          </li>
          <li>
            <RouterLink
              to="/about"
              class="block rounded-lg px-4 py-3 font-medium text-vn-text no-underline transition hover:bg-vn-surface2 hover:text-vn-accent"
              @click="closeMobile"
            >About</RouterLink>
          </li>
          <li>
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-lg font-medium text-vn-text transition hover:bg-vn-surface2 hover:text-vn-accent"
              @click="mobileFeaturesSub = !mobileFeaturesSub"
            >
              Features
              <span
                class="text-[0.7rem] text-vn-muted transition-transform duration-200"
                :class="mobileFeaturesSub ? 'rotate-180' : ''"
              >▾</span>
            </button>
            <Transition name="sub-expand">
              <ul v-if="mobileFeaturesSub" class="ml-4 mt-1 flex flex-col gap-0.5 border-l border-vn-border2 pl-4">
                <li v-for="feature in featureLinks" :key="feature.label">
                  <a
                    :href="feature.href"
                    :target="feature.openInNewTab ? '_blank' : undefined"
                    :rel="feature.openInNewTab ? 'noopener noreferrer' : undefined"
                    class="block rounded-md px-3 py-2 text-[0.95rem] text-vn-muted no-underline transition hover:bg-vn-surface2 hover:text-vn-text"
                    @click="closeMobile"
                  >{{ feature.label }}</a>
                </li>
              </ul>
            </Transition>
          </li>
          <li>
            <RouterLink
              to="/governance"
              class="block rounded-lg px-4 py-3 font-medium text-vn-text no-underline transition hover:bg-vn-surface2 hover:text-vn-accent"
              @click="closeMobile"
            >Governance</RouterLink>
          </li>
          <li>
            <RouterLink
              to="/docs"
              class="block rounded-lg px-4 py-3 font-medium text-vn-text no-underline transition hover:bg-vn-surface2 hover:text-vn-accent"
              @click="closeMobile"
            >Docs</RouterLink>
          </li>
          <li>
            <RouterLink
              to="/use-cases"
              class="block rounded-lg px-4 py-3 font-medium text-vn-text no-underline transition hover:bg-vn-surface2 hover:text-vn-accent"
              @click="closeMobile"
            >Use Cases</RouterLink>
          </li>
          <li>
            <a
              href="mailto:hello@volnux.ai"
              class="block rounded-lg px-4 py-3 font-medium text-vn-text no-underline transition hover:bg-vn-surface2 hover:text-vn-accent"
              @click="closeMobile"
            >Contact Us</a>
          </li>
        </ul>

        <!-- CTA at bottom of mobile nav -->
        <div class="mt-auto pt-8">
          <RouterLink
            to="/"
            class="vn-btn-primary flex w-full justify-center"
            @click="closeMobile"
          >Get Early Access</RouterLink>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Mobile nav overlay transitions */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.mobile-nav-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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
