<script setup lang="ts">
import { computed, ref } from 'vue'

import EventHubEventCard from '@/components/eventhub/EventHubEventCard.vue'
import { eventHubCategories, eventHubEvents, sourceLabels } from '@/data/eventhub'
import type { EventSource } from '@/types/eventhub'

const search = ref('')
const activeCategory = ref<(typeof eventHubCategories)[number]>('All')
const activeSources = ref<Record<EventSource, boolean>>({
  pypi: true,
  git: true,
  hub: true,
  local: false,
})
const officialOnly = ref(false)
const sortBy = ref<'downloads' | 'alphabetical'>('downloads')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  let rows = eventHubEvents.filter((e) => activeSources.value[e.source])
  if (activeCategory.value !== 'All') rows = rows.filter((e) => e.category === activeCategory.value)
  if (officialOnly.value) rows = rows.filter((e) => e.verified === 'official')
  if (q) {
    rows = rows.filter((e) => `${e.name} ${e.description} ${e.tags.join(' ')}`.toLowerCase().includes(q))
  }
  if (sortBy.value === 'alphabetical') rows = [...rows].sort((a, b) => a.name.localeCompare(b.name))
  return rows
})

function categoryCount(category: (typeof eventHubCategories)[number]) {
  if (category === 'All') return eventHubEvents.length
  return eventHubEvents.filter((e) => e.category === category).length
}
</script>

<template>
  <main class="pb-24 pt-24 text-vn-text lg:pt-28">
    <section class="border-b border-vn-border bg-vn-surface2/20">
      <div class="vn-container py-16">
        <p class="mb-4 inline-flex items-center gap-2 rounded-sm border border-amber-400/20 bg-amber-400/10 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-amber-300">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
          EventHub beta
        </p>
        <h1 class="font-display text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.95] tracking-tight text-vn-white">
          Every workflow starts<br />with an event.
        </h1>
        <p class="mt-4 max-w-2xl text-lg text-vn-muted">
          Browse reusable EventBase components from PyPI, Git, and EventHub. This page is intentionally structured for future backend integration.
        </p>
        <div class="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            v-model="search"
            type="text"
            class="w-full rounded border border-vn-border2 bg-vn-surface px-4 py-3 font-mono text-sm text-vn-text outline-none transition focus:border-vn-accent"
            placeholder="Search events e.g. PostgresExtract, GPT4Transform..."
          />
          <button class="rounded bg-amber-400 px-6 py-3 font-mono text-sm font-medium text-black transition hover:bg-amber-300">
            Search
          </button>
        </div>
      </div>
    </section>

    <section class="sticky top-[72px] z-40 border-b border-vn-border bg-vn-surface/95 backdrop-blur">
      <div class="vn-container flex gap-1 overflow-x-auto py-2">
        <button
          v-for="category in eventHubCategories"
          :key="category"
          class="whitespace-nowrap rounded px-3 py-2 font-mono text-[0.72rem] transition"
          :class="activeCategory === category ? 'bg-amber-400/20 text-amber-300' : 'text-vn-muted hover:text-vn-text'"
          @click="activeCategory = category"
        >
          {{ category }} <span class="ml-1 text-[0.65rem] text-vn-muted2">{{ categoryCount(category) }}</span>
        </button>
      </div>
    </section>

    <section class="vn-container mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside class="space-y-8 lg:sticky lg:top-32 lg:self-start">
        <div>
          <p class="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-vn-muted2">Source</p>
          <label v-for="(label, source) in sourceLabels" :key="source" class="mb-2 flex cursor-pointer items-center gap-2 text-sm text-vn-muted">
            <input v-model="activeSources[source]" type="checkbox" class="accent-vn-accent" />
            {{ label }}
          </label>
        </div>
        <div>
          <p class="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-vn-muted2">Verified</p>
          <label class="flex cursor-pointer items-center gap-2 text-sm text-vn-muted">
            <input v-model="officialOnly" type="checkbox" class="accent-vn-accent3" />
            Official only
          </label>
        </div>
      </aside>

      <div>
        <div class="mb-4 flex items-center justify-between border-b border-vn-border pb-3">
          <p class="font-mono text-xs text-vn-muted2">Showing <span class="text-vn-text">{{ filtered.length }}</span> events</p>
          <select v-model="sortBy" class="rounded border border-vn-border2 bg-vn-surface px-2.5 py-1.5 font-mono text-xs text-vn-muted">
            <option value="downloads">Most downloaded</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div class="overflow-hidden rounded-lg border border-vn-border">
          <EventHubEventCard v-for="event in filtered" :key="event.slug" :event="event" />
        </div>
      </div>
    </section>
  </main>
</template>
