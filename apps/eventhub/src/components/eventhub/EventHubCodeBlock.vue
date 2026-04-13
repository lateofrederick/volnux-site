<script setup lang="ts">
const props = defineProps<{
  language: string
  code: string
}>()

async function copyCode() {
  await navigator.clipboard.writeText(props.code)
}
</script>

<template>
  <div class="code-block">
    <div class="code-bar">
      <span class="cd cd-r"></span>
      <span class="cd cd-y"></span>
      <span class="cd cd-g"></span>
      <span class="code-lang">{{ language }}</span>
      <button type="button" class="code-copy" @click="copyCode">copy</button>
    </div>
    <pre class="code-body"><code>{{ code }}</code></pre>
  </div>
</template>
