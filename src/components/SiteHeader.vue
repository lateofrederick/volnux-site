<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const featuresOpen = ref(false)
const mobileOpen = ref(false)
const mobileFeaturesSub = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const isScrolled = ref(false)

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

function onScroll() {
  isScrolled.value = window.scrollY > 20
}

watch(() => route.fullPath, () => closeMobile())

onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('scroll', onScroll)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})
</script>

<template>
  <header
    class="fixed left-0 right-0 top-0 z-50 transition-all duration-300"
    :class="isScrolled 
      ? 'border-b border-slate-200/50 bg-white/95 backdrop-blur-xl dark:border-slate-800/50 dark:bg-[#0a0a0f]/95' 
      : 'bg-white/50 dark:bg-transparent'"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <RouterLink to="/" class="group flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <span class="text-lg font-bold">V</span>
          </div>
          <span class="text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
            volnux
          </span>
        </RouterLink>

        <!-- Desktop nav -->
        <ul class="hidden items-center gap-1 lg:flex">
          <li>
            <RouterLink
              to="/"
              class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              :class="route.path === '/' ? 'text-indigo-600 dark:text-white' : ''"
            >
              Home
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/about"
              class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              :class="route.path === '/about' ? 'text-indigo-600 dark:text-white' : ''"
            >
              About
            </RouterLink>
          </li>
          <li ref="dropdownRef" class="relative">
            <button
              type="button"
              class="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              :class="featuresOpen ? 'text-indigo-600 dark:text-white' : ''"
              @click.stop="featuresOpen = !featuresOpen"
            >
              Products
              <svg class="h-4 w-4 transition-transform duration-200" :class="featuresOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <ul
                v-if="featuresOpen"
                class="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-[#0c0c10]"
              >
                <li v-for="feature in featureLinks" :key="feature.label">
                  <RouterLink
                    class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    :to="feature.to"
                    @click="closeFeatures"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {{ feature.label }}
                  </RouterLink>
                </li>
              </ul>
            </Transition>
          </li>
          <li>
            <RouterLink
              to="/governance"
              class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              :class="route.path === '/governance' ? 'text-indigo-600 dark:text-white' : ''"
            >
              Governance
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/docs"
              class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              :class="route.path === '/docs' ? 'text-indigo-600 dark:text-white' : ''"
            >
              Docs
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/use-cases"
              class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              :class="route.path === '/use-cases' ? 'text-indigo-600 dark:text-white' : ''"
            >
              Use Cases
            </RouterLink>
          </li>
        </ul>

        <!-- Right side: Theme toggle + CTA -->
        <div class="hidden items-center gap-3 lg:flex">
          <!-- Theme Toggle -->
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:border-indigo-500/50 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-indigo-400"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleTheme"
          >
            <!-- Sun icon for dark mode (switch to light) -->
            <svg v-if="isDark" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon icon for light mode (switch to dark) -->
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <a
            href="#"
            class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40"
          >
            Get Access
          </a>
        </div>

        <!-- Mobile hamburger -->
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle navigation menu"
          @click="toggleMobile"
        >
          <div class="flex flex-col items-center justify-center gap-1.5">
            <span
              class="block h-0.5 w-5 rounded-full bg-current transition-all duration-300"
              :class="mobileOpen ? 'translate-y-2 rotate-45' : ''"
            />
            <span
              class="block h-0.5 w-5 rounded-full bg-current transition-all duration-200"
              :class="mobileOpen ? 'opacity-0' : 'opacity-100'"
            />
            <span
              class="block h-0.5 w-5 rounded-full bg-current transition-all duration-300"
              :class="mobileOpen ? '-translate-y-2 -rotate-45' : ''"
            />
          </div>
        </button>
      </nav>
    </div>

    <!-- Mobile nav overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40 bg-white/98 backdrop-blur-xl dark:bg-[#0a0a0f]/98 lg:hidden"
        @click.self="closeMobile"
      >
        <div class="flex h-full flex-col overflow-y-auto px-4 pb-8 pt-20">
          <!-- Mobile theme toggle -->
          <div class="mb-4 flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Theme</span>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-400"
              @click="toggleTheme"
            >
              <svg v-if="isDark" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>

          <ul class="flex flex-col gap-1">
            <li>
              <RouterLink
                to="/"
                class="block rounded-lg px-4 py-3 text-base font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"
                :class="route.path === '/' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : ''"
                @click="closeMobile"
              >
                Home
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/about"
                class="block rounded-lg px-4 py-3 text-base font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                :class="route.path === '/about' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : ''"
                @click="closeMobile"
              >
                About
              </RouterLink>
            </li>
            <li>
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                @click="mobileFeaturesSub = !mobileFeaturesSub"
              >
                Products
                <svg class="h-4 w-4 text-slate-400 transition-transform" :class="mobileFeaturesSub ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-48"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 max-h-48"
                leave-to-class="opacity-0 max-h-0"
              >
                <ul v-if="mobileFeaturesSub" class="ml-4 mt-1 space-y-1 overflow-hidden">
                  <li v-for="feature in featureLinks" :key="feature.label">
                    <RouterLink
                      :to="feature.to"
                      class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      @click="closeMobile"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      {{ feature.label }}
                    </RouterLink>
                  </li>
                </ul>
              </Transition>
            </li>
            <li>
              <RouterLink
                to="/governance"
                class="block rounded-lg px-4 py-3 text-base font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                :class="route.path === '/governance' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : ''"
                @click="closeMobile"
              >
                Governance
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/docs"
                class="block rounded-lg px-4 py-3 text-base font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                :class="route.path === '/docs' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : ''"
                @click="closeMobile"
              >
                Docs
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/use-cases"
                class="block rounded-lg px-4 py-3 text-base font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                :class="route.path === '/use-cases' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : ''"
                @click="closeMobile"
              >
                Use Cases
              </RouterLink>
            </li>
          </ul>

          <div class="mt-auto pt-8">
            <a
              href="#"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg"
            >
              Get Early Access
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </header>

  <div class="h-16" />
</template>
