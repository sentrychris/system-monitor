<script setup lang="ts">
defineProps<{
  decorTitle: string;
  title: string;
}>();
</script>

<template>
  <div class="row">
    <div class="col">
      <p class="text-muted decor small">{{ decorTitle }}</p>
      <h1 class="header">{{ title }}</h1>
    </div>
  </div>
</template>