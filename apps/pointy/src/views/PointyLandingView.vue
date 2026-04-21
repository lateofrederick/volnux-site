<script setup lang="ts">
import { computed } from 'vue'

const frameSrc = computed(() => `${import.meta.env.BASE_URL}wizard-product.html`)
</script>

<template>
  <div class="min-h-0 flex-1 overflow-hidden">
    <iframe :src="frameSrc" class="h-[100dvh] w-full border-0" title="Pointy-lang" />
  </div>
</template>
