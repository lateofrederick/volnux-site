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
  <div class="overflow-hidden rounded-md border border-vn-border bg-[#0a0d12]">
    <div class="flex items-center gap-2 border-b border-vn-border px-4 py-2">
      <span class="h-2 w-2 rounded-full bg-[#ff5f57]" />
      <span class="h-2 w-2 rounded-full bg-[#ffbd2e]" />
      <span class="h-2 w-2 rounded-full bg-[#28c840]" />
      <span class="ml-auto font-mono text-[0.65rem] uppercase tracking-wide text-vn-muted2">{{ language }}</span>
      <button class="rounded border border-vn-border2 px-2 py-0.5 font-mono text-[0.65rem] text-vn-muted2 transition hover:text-vn-accent" @click="copyCode">
        copy
      </button>
    </div>
    <pre class="overflow-x-auto p-4 font-mono text-[0.86rem] leading-7 text-vn-text"><code>{{ code }}</code></pre>
  </div>
</template>
