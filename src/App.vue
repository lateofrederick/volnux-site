<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import MeshRuntimeFooter from './components/MeshRuntimeFooter.vue'

const route = useRoute()

watch(
  () => route.name,
  (name) => {
    document.getElementById('app')?.classList.toggle('mesh-active', name === 'mesh-runtime')
  },
  { immediate: true },
)
</script>

<template>
  <SiteHeader />
  <RouterView />
  <MeshRuntimeFooter v-if="route.name === 'mesh-runtime'" />
  <SiteFooter v-else />
</template>
