<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import type { EventHubEvent } from '@/types/eventhub'

const props = defineProps<{ event: EventHubEvent }>()

const iconMod = computed(() => {
  const map: Record<EventHubEvent['accent'], string> = {
    cyan: 'event-icon--cyan',
    purple: 'event-icon--purple',
    green: 'event-icon--green',
    amber: 'event-icon--amber',
    red: 'event-icon--red',
    pink: 'event-icon--pink',
  }
  return map[props.event.accent]
})

const sourceMod = computed(() => {
  const map: Record<EventHubEvent['source'], string> = {
    pypi: 'source--pypi',
    git: 'source--git',
    hub: 'source--hub',
    local: 'source--local',
  }
  return map[props.event.source]
})
</script>

<template>
  <RouterLink :to="{ name: 'eventhub-detail', params: { slug: event.slug } }" class="event-card">
    <div class="event-icon" :class="iconMod">{{ event.icon }}</div>
    <div>
      <p class="event-name">{{ event.name }} <span>@{{ event.version }}</span></p>
      <p class="event-desc">{{ event.description }}</p>
      <div class="event-tags">
        <span v-for="tag in event.tags" :key="tag" class="tag tag--cyan">{{ tag }}</span>
      </div>
    </div>
    <div class="event-meta">
      <span class="event-source" :class="sourceMod">{{ event.source }}</span>
      <span class="event-version">{{ event.version }}</span>
      <span class="event-downloads">{{ event.downloadsMonthly }}</span>
      <span class="event-verified">{{ event.verified }}</span>
    </div>
  </RouterLink>
</template>
