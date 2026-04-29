<script setup lang="ts">
import { RouterView } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col transition-colors duration-300">
    <SiteHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <SiteFooter />
  </div>
</template>
