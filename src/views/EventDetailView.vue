<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import EventHubCodeBlock from '@/components/eventhub/EventHubCodeBlock.vue'
import { findEventBySlug, relatedEvents } from '@/data/eventhub'

const route = useRoute()
const activeTab = ref<'overview' | 'parameters' | 'examples' | 'changelog'>('overview')

const event = computed(() => findEventBySlug(String(route.params.slug ?? '')))
const related = computed(() => (event.value ? relatedEvents(event.value.slug) : []))

function copyInstall(refValue: string) {
  void navigator.clipboard.writeText(refValue)
}
</script>

<template>
  <main class="pb-24 pt-24 text-vn-text lg:pt-28">
    <div v-if="!event" class="vn-container py-20">
      <h1 class="mb-4 font-display text-4xl text-vn-white">Event not found</h1>
      <RouterLink class="text-vn-accent no-underline hover:underline" to="/products/eventhub">Back to EventHub</RouterLink>
    </div>

    <div v-else class="vn-container grid gap-10 py-8 lg:grid-cols-[1fr_320px]">
      <main class="min-w-0">
        <div class="mb-8 border-b border-vn-border pb-8">
          <RouterLink to="/products/eventhub" class="mb-3 inline-block font-mono text-xs text-vn-muted no-underline hover:text-vn-accent">
            EventHub / {{ event.category }}
          </RouterLink>
          <h1 class="font-mono text-3xl font-medium text-vn-white">{{ event.name }} <span class="text-vn-muted2">{{ event.version }}</span></h1>
          <p class="mt-4 max-w-3xl text-vn-muted">{{ event.description }}</p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span v-for="tag in event.tags" :key="tag" class="rounded border border-vn-border2 px-2 py-0.5 font-mono text-[0.65rem] text-vn-muted2">
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="mb-8 flex flex-wrap border-b border-vn-border">
          <button class="px-4 py-2 font-mono text-xs" :class="activeTab === 'overview' ? 'border-b-2 border-vn-accent text-vn-text' : 'text-vn-muted2'" @click="activeTab = 'overview'">Overview</button>
          <button class="px-4 py-2 font-mono text-xs" :class="activeTab === 'parameters' ? 'border-b-2 border-vn-accent text-vn-text' : 'text-vn-muted2'" @click="activeTab = 'parameters'">Parameters</button>
          <button class="px-4 py-2 font-mono text-xs" :class="activeTab === 'examples' ? 'border-b-2 border-vn-accent text-vn-text' : 'text-vn-muted2'" @click="activeTab = 'examples'">Examples</button>
          <button class="px-4 py-2 font-mono text-xs" :class="activeTab === 'changelog' ? 'border-b-2 border-vn-accent text-vn-text' : 'text-vn-muted2'" @click="activeTab = 'changelog'">Changelog</button>
        </div>

        <section v-if="activeTab === 'overview'" class="space-y-5">
          <p v-for="text in event.detail.overview" :key="text" class="text-vn-muted">{{ text }}</p>
          <EventHubCodeBlock language="python" :code="event.detail.interfaceCode" />
        </section>

        <section v-else-if="activeTab === 'parameters'" class="overflow-hidden rounded-lg border border-vn-border">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-vn-surface2/60 font-mono text-[0.68rem] uppercase tracking-wide text-vn-muted2">
              <tr>
                <th class="px-3 py-2 text-left">Name</th>
                <th class="px-3 py-2 text-left">Type</th>
                <th class="px-3 py-2 text-left">Required</th>
                <th class="px-3 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="param in event.detail.parameters" :key="param.name" class="border-t border-vn-border">
                <td class="px-3 py-2 font-mono text-vn-accent">{{ param.name }}</td>
                <td class="px-3 py-2 font-mono text-vn-muted">{{ param.type }}</td>
                <td class="px-3 py-2 font-mono text-xs" :class="param.required ? 'text-rose-300' : 'text-vn-muted2'">
                  {{ param.required ? 'required' : 'optional' }}
                </td>
                <td class="px-3 py-2 text-vn-muted">
                  {{ param.description }}
                  <span v-if="param.defaultValue" class="block pt-1 font-mono text-xs text-vn-muted2">default: {{ param.defaultValue }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section v-else-if="activeTab === 'examples'" class="space-y-6">
          <article v-for="example in event.detail.usageExamples" :key="example.title">
            <h3 class="mb-2 font-mono text-sm text-vn-white">{{ example.title }}</h3>
            <EventHubCodeBlock :language="example.language" :code="example.code" />
          </article>
        </section>

        <section v-else class="space-y-5">
          <article v-for="entry in event.detail.changelog" :key="entry.version" class="border-b border-vn-border pb-4">
            <p class="font-mono text-sm text-vn-white">{{ entry.version }} <span class="ml-2 text-xs text-vn-muted2">{{ entry.date }}</span></p>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-vn-muted">
              <li v-for="item in entry.items" :key="item">{{ item }}</li>
            </ul>
          </article>
        </section>

        <section class="mt-12">
          <h3 class="mb-3 font-mono text-xs uppercase tracking-wide text-vn-muted2">Related events</h3>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <RouterLink
              v-for="row in related"
              :key="row.slug"
              :to="{ name: 'eventhub-event-detail', params: { slug: row.slug } }"
              class="rounded border border-vn-border bg-vn-surface2/60 p-4 text-inherit no-underline transition hover:bg-vn-surface2"
            >
              <p class="font-mono text-sm text-vn-white">{{ row.name }}</p>
              <p class="mt-1 text-xs text-vn-muted">{{ row.downloadsMonthly }}</p>
            </RouterLink>
          </div>
        </section>
      </main>

      <aside class="space-y-4 lg:sticky lg:top-32 lg:self-start">
        <div class="rounded-lg border border-vn-border bg-vn-surface2/60 p-4">
          <p class="mb-3 font-mono text-[0.65rem] uppercase tracking-wide text-vn-muted2">Install references</p>
          <button
            v-for="refValue in event.detail.installRefs"
            :key="refValue"
            class="mb-2 w-full rounded border border-vn-border2 bg-vn-black/40 px-3 py-2 text-left font-mono text-xs text-vn-text transition hover:border-vn-accent"
            @click="copyInstall(refValue)"
          >
            {{ refValue }}
          </button>
        </div>
        <div class="rounded-lg border border-vn-border bg-vn-surface2/60 p-4">
          <p class="mb-3 font-mono text-[0.65rem] uppercase tracking-wide text-vn-muted2">Stats</p>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="stat in event.stats" :key="stat.label" class="rounded border border-vn-border2 px-2 py-2">
              <p class="font-mono text-sm text-vn-white">{{ stat.value }}</p>
              <p class="font-mono text-[0.6rem] uppercase tracking-wide text-vn-muted2">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </main>
</template>
