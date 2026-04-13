<script setup lang="ts">
import type { EventHubEvent } from '@/types/eventhub'

defineProps<{ event: EventHubEvent }>()

const accentClass: Record<EventHubEvent['accent'], string> = {
  cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
  purple: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  red: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  pink: 'border-pink-400/30 bg-pink-400/10 text-pink-300',
}
</script>

<template>
  <RouterLink
    :to="{ name: 'eventhub-event-detail', params: { slug: event.slug } }"
    class="grid grid-cols-[auto_1fr_auto] gap-4 border-b border-vn-border bg-vn-surface2/70 p-5 text-inherit no-underline transition hover:bg-vn-surface2"
  >
    <div class="flex h-10 w-10 items-center justify-center rounded-md border text-xs font-semibold" :class="accentClass[event.accent]">
      {{ event.icon }}
    </div>
    <div class="min-w-0">
      <p class="mb-1 font-mono text-sm text-vn-white">{{ event.name }} <span class="text-vn-muted2">{{ event.version }}</span></p>
      <p class="mb-3 text-sm text-vn-muted">{{ event.description }}</p>
      <div class="flex flex-wrap gap-1.5">
        <span v-for="tag in event.tags" :key="tag" class="rounded border border-vn-border2 px-2 py-0.5 font-mono text-[0.65rem] text-vn-muted2">
          {{ tag }}
        </span>
      </div>
    </div>
    <div class="hidden min-w-[92px] shrink-0 text-right sm:block">
      <p class="mb-1 font-mono text-[0.68rem] uppercase tracking-wide text-vn-accent">{{ event.source }}</p>
      <p class="font-mono text-[0.68rem] text-vn-muted2">{{ event.downloadsMonthly }}</p>
      <p class="mt-2 font-mono text-[0.68rem]" :class="event.verified === 'official' ? 'text-vn-accent3' : 'text-vn-muted2'">
        {{ event.verified }}
      </p>
    </div>
  </RouterLink>
</template>
