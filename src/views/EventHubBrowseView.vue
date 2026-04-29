<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="vn-section">
    <div class="vn-container py-16">
      <div class="mb-8 flex items-center gap-2 text-sm text-vn-muted">
        <RouterLink to="/products/eventhub" class="hover:text-vn-accent">EventHub</RouterLink>
        <span>/</span>
        <span class="text-vn-text">Browse</span>
      </div>

      <h1 class="vn-section-title mb-4">Browse Registry</h1>
      <p class="vn-section-sub mb-12 max-w-2xl">
        Explore the curated collection of events available in the EventHub registry.
        This is a preview of the upcoming EventHub platform.
      </p>

      <!-- Search placeholder -->
      <div class="mb-8">
        <div class="relative max-w-xl">
          <input
            type="text"
            placeholder="Search events..."
            class="w-full rounded-lg border border-vn-border bg-vn-surface px-4 py-3 pl-10 text-vn-text placeholder:text-vn-muted focus:border-vn-accent focus:outline-none"
          />
          <svg
            class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-vn-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Event cards grid -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="i in 6"
          :key="i"
          class="rounded-lg border border-vn-border bg-vn-surface p-5 transition-colors hover:border-vn-border2 hover:bg-vn-surface2"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="rounded border border-vn-border px-2 py-0.5 font-mono text-xs text-vn-muted">pypi</span>
            <span class="font-mono text-xs text-vn-muted">v1.{{ i }}.0</span>
          </div>
          <h3 class="mb-2 font-display text-lg font-bold text-vn-text">Event Name {{ i }}</h3>
          <p class="mb-4 text-sm text-vn-muted">A sample event description for demonstration purposes.</p>
          <div class="flex items-center gap-2 text-xs text-vn-muted">
            <span class="size-2 rounded-full bg-vn-accent"></span>
            <span>Ready</span>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center">
        <p class="mb-4 text-sm text-vn-muted">
          The full EventHub registry is coming soon.
        </p>
        <RouterLink to="/products/eventhub" class="vn-btn-outline">
          Back to EventHub
        </RouterLink>
      </div>
    </div>
  </div>
</template>
