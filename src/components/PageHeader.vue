<script setup lang="ts">
defineProps<{
  decorTitle: string;
  title: string;
}>();
</script>

<template>
  <div class="page-header">
    <div class="eyebrow">{{ decorTitle }}</div>
    <h1 class="page-title">{{ title }}</h1>
  </div>
</template>

<style scoped>
.page-header {
  padding: 0.75rem 0 0.25rem;
}
.page-title {
  font-weight: 200;
  font-size: 2.25rem;
  letter-spacing: -0.5px;
  color: #111827;
  margin: 0.15rem 0 0;
}
body[data-theme="dark"] .page-title { color: #f5f5f5; }

@media (max-width: 575.98px) {
  .page-title { font-size: 1.7rem; }
}
</style>
