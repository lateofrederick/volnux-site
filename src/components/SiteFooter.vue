<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { productUrls } from '@/config/product-urls'
</script>

<template>
  <footer class="relative z-10 border-t border-vn-border bg-vn-black">
    <div class="vn-container py-12 sm:py-16">
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">
        <!-- Brand -->
        <div>
          <RouterLink to="/" class="font-display text-xl font-bold tracking-tight text-vn-white transition-colors hover:text-vn-accent">
            vol<span class="text-vn-accent">nux</span>
          </RouterLink>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-vn-muted">
            The workflow operating system for the AI age. Write once. Run anywhere. Govern everything.
          </p>
        </div>

        <!-- Features -->
        <div>
          <h4 class="mb-4 font-display text-xs font-bold uppercase tracking-wider text-vn-text">Features</h4>
          <ul class="flex flex-col gap-2 text-sm">
            <li>
              <a
                class="text-vn-muted transition-colors hover:text-vn-text"
                :href="productUrls.pointy"
                target="_blank"
                rel="noopener noreferrer"
              >Pointy-lang</a>
            </li>
            <li>
              <a
                class="text-vn-muted transition-colors hover:text-vn-text"
                :href="productUrls.eventhub"
                target="_blank"
                rel="noopener noreferrer"
              >EventHub</a>
            </li>
            <li>
              <a
                class="text-vn-muted transition-colors hover:text-vn-text"
                :href="productUrls.mesh"
                target="_blank"
                rel="noopener noreferrer"
              >Mesh Runtime</a>
            </li>
            <li>
              <a class="text-vn-muted transition-colors hover:text-vn-text" :href="productUrls.changelog">Changelog</a>
            </li>
          </ul>
        </div>

        <!-- Developers -->
        <div>
          <h4 class="mb-4 font-display text-xs font-bold uppercase tracking-wider text-vn-text">Developers</h4>
          <ul class="flex flex-col gap-2 text-sm">
            <li>
              <RouterLink class="text-vn-muted transition-colors hover:text-vn-text" to="/docs">Documentation</RouterLink>
            </li>
            <li>
              <a href="#" class="text-vn-muted transition-colors hover:text-vn-text">GitHub</a>
            </li>
            <li>
              <a href="#" class="text-vn-muted transition-colors hover:text-vn-text">Examples</a>
            </li>
            <li>
              <a href="#" class="text-vn-muted transition-colors hover:text-vn-text">Community</a>
            </li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="mb-4 font-display text-xs font-bold uppercase tracking-wider text-vn-text">Company</h4>
          <ul class="flex flex-col gap-2 text-sm">
            <li>
              <RouterLink class="text-vn-muted transition-colors hover:text-vn-text" to="/about">About</RouterLink>
            </li>
            <li>
              <RouterLink class="text-vn-muted transition-colors hover:text-vn-text" :to="{ path: '/', hash: '#features' }">Features</RouterLink>
            </li>
            <li>
              <RouterLink class="text-vn-muted transition-colors hover:text-vn-text" to="/governance">Governance</RouterLink>
            </li>
            <li>
              <RouterLink class="text-vn-muted transition-colors hover:text-vn-text" to="/use-cases">Use Cases</RouterLink>
            </li>
            <li>
              <a href="mailto:hello@volnux.ai" class="text-vn-muted transition-colors hover:text-vn-text">Contact Us</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-10 flex flex-col gap-4 border-t border-vn-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p class="font-mono text-xs text-vn-muted2">© 2026 Volnux. All rights reserved.</p>
        <p class="font-mono text-xs text-vn-muted2">
          Built with <span class="text-vn-accent">Pointy-lang</span>. Governed by design.
        </p>
      </div>
    </div>
  </footer>
</template>
