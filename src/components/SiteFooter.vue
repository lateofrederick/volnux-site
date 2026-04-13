<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { productUrls } from '@/config/product-urls'
</script>

<template>
  <footer class="relative z-[1] border-t border-vn-border py-16 pb-12">
    <div class="vn-container">
      <div class="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">
        <div>
          <RouterLink to="/" class="font-display text-2xl font-extrabold tracking-tight text-vn-white no-underline">
            vol<span class="text-vn-accent">nux</span>
          </RouterLink>
          <p class="mt-4 max-w-[280px] text-[0.875rem] leading-relaxed text-vn-muted">
            The workflow operating system for the AI age. Write once. Run anywhere. Govern everything.
          </p>
        </div>
        <div>
          <h4 class="mb-4 font-display text-[0.8rem] font-bold uppercase tracking-wider text-vn-text">Product</h4>
          <ul class="flex flex-col gap-2.5 text-[0.875rem]">
            <li>
              <a
                class="text-vn-muted no-underline transition hover:text-vn-text"
                :href="productUrls.pointy"
                target="_blank"
                rel="noopener noreferrer"
                >Pointy-lang</a
              >
            </li>
            <li>
              <a
                class="text-vn-muted no-underline transition hover:text-vn-text"
                :href="productUrls.eventhub"
                target="_blank"
                rel="noopener noreferrer"
                >EventHub</a
              >
            </li>
            <li>
              <a
                class="text-vn-muted no-underline transition hover:text-vn-text"
                :href="productUrls.mesh"
                target="_blank"
                rel="noopener noreferrer"
                >Mesh Runtime</a
              >
            </li>
            <li><a class="text-vn-muted no-underline transition hover:text-vn-text" :href="productUrls.changelog">Changelog</a></li>
          </ul>
        </div>
        <div>
          <h4 class="mb-4 font-display text-[0.8rem] font-bold uppercase tracking-wider text-vn-text">Developers</h4>
          <ul class="flex flex-col gap-2.5 text-[0.875rem]">
            <li><RouterLink class="text-vn-muted no-underline transition hover:text-vn-text" to="/docs">Documentation</RouterLink></li>
            <li><a href="#" class="text-vn-muted no-underline transition hover:text-vn-text">GitHub</a></li>
            <li><a href="#" class="text-vn-muted no-underline transition hover:text-vn-text">Examples</a></li>
            <li><a href="#" class="text-vn-muted no-underline transition hover:text-vn-text">Community</a></li>
          </ul>
        </div>
        <div>
          <h4 class="mb-4 font-display text-[0.8rem] font-bold uppercase tracking-wider text-vn-text">Company</h4>
          <ul class="flex flex-col gap-2.5 text-[0.875rem]">
            <li><a href="#" class="text-vn-muted no-underline transition hover:text-vn-text">About</a></li>
            <li><a href="#" class="text-vn-muted no-underline transition hover:text-vn-text">Blog</a></li>
            <li><RouterLink class="text-vn-muted no-underline transition hover:text-vn-text" to="/">Early Access</RouterLink></li>
            <li><a href="#" class="text-vn-muted no-underline transition hover:text-vn-text">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="flex flex-col gap-4 border-t border-vn-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p class="font-mono text-[0.8rem] text-vn-muted2">© 2026 Volnux. All rights reserved.</p>
        <p class="font-mono text-[0.75rem] text-vn-muted2">
          Built with <span class="text-vn-accent">Pointy-lang</span>. Governed by design.
        </p>
      </div>
    </div>
  </footer>
</template>
