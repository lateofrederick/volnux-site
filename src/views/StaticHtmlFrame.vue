<script setup lang="ts">
defineProps<{
  /** Absolute path under site root, e.g. `/about.html` */
  src: string
}>()
</script>

<template>
  <main class="min-h-0 flex-1 pt-[72px]">
    <iframe :src="src" class="h-[calc(100dvh-72px)] w-full border-0" :title="src" />
  </main>
</template>
