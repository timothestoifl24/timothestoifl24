<script setup lang="ts">
defineProps<{ status: string }>()
</script>

<template>
  <span class="status-badge" :class="`status-${status}`">
    <span class="dot" aria-hidden="true"></span>{{ status }}
  </span>
</template>
