<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white"
    :class="colorClass"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  colorClass: string
}>()
</script>
