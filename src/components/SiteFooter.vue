<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { productUrls } from '@/config/product-urls'
</script>

<template>
  <footer class="border-t border-slate-800/50 bg-[#0a0a0f]">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <!-- Brand -->
        <div class="lg:col-span-2">
          <RouterLink to="/" class="group flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <span class="text-lg font-bold">V</span>
            </div>
            <span class="text-xl font-bold tracking-tight text-white">
              volnux
            </span>
          </RouterLink>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            The workflow operating system for the AI age. Write once. Run anywhere. Govern everything.
          </p>
          <div class="mt-6 flex gap-3">
            <a href="#" class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition-all hover:border-indigo-500/50 hover:text-indigo-400">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.419-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition-all hover:border-indigo-500/50 hover:text-indigo-400">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

        <!-- Products -->
        <div>
          <h4 class="mb-3 text-xs font-semibold uppercase tracking-wider text-white">Products</h4>
          <ul class="space-y-2 text-sm">
            <li><a :href="productUrls.pointy" target="_blank" rel="noopener noreferrer" class="text-slate-500 transition-colors hover:text-indigo-400">Pointy-lang</a></li>
            <li><a :href="productUrls.eventhub" target="_blank" rel="noopener noreferrer" class="text-slate-500 transition-colors hover:text-indigo-400">EventHub</a></li>
            <li><a :href="productUrls.mesh" target="_blank" rel="noopener noreferrer" class="text-slate-500 transition-colors hover:text-indigo-400">Mesh Runtime</a></li>
            <li><a :href="productUrls.changelog" class="text-slate-500 transition-colors hover:text-indigo-400">Changelog</a></li>
          </ul>
        </div>

        <!-- Developers -->
        <div>
          <h4 class="mb-3 text-xs font-semibold uppercase tracking-wider text-white">Developers</h4>
          <ul class="space-y-2 text-sm">
            <li><RouterLink to="/docs" class="text-slate-500 transition-colors hover:text-indigo-400">Documentation</RouterLink></li>
            <li><a href="#" class="text-slate-500 transition-colors hover:text-indigo-400">GitHub</a></li>
            <li><a href="#" class="text-slate-500 transition-colors hover:text-indigo-400">Examples</a></li>
            <li><a href="#" class="text-slate-500 transition-colors hover:text-indigo-400">Community</a></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="mb-3 text-xs font-semibold uppercase tracking-wider text-white">Company</h4>
          <ul class="space-y-2 text-sm">
            <li><RouterLink to="/about" class="text-slate-500 transition-colors hover:text-indigo-400">About</RouterLink></li>
            <li><RouterLink to="/governance" class="text-slate-500 transition-colors hover:text-indigo-400">Governance</RouterLink></li>
            <li><RouterLink to="/use-cases" class="text-slate-500 transition-colors hover:text-indigo-400">Use Cases</RouterLink></li>
            <li><a href="mailto:hello@volnux.ai" class="text-slate-500 transition-colors hover:text-indigo-400">Contact</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800/50 pt-8 sm:flex-row">
        <p class="text-xs text-slate-600">© 2026 Volnux. All rights reserved.</p>
        <p class="text-xs text-slate-600">Built with <span class="text-indigo-400">Pointy-lang</span>. Governed by design.</p>
      </div>
    </div>
  </footer>
</template>
