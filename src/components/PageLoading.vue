<script setup lang="ts">
import { useLoadingStore } from "@/stores/loading";
const loader = useLoadingStore();
</script>

<template>
  <div
    class="h-100 d-flex flex-column align-items-center justify-content-center"
    id="loading"
    v-if="!loader.loaded"
  >
    <div class="mask">
      <font-awesome-icon
        v-if="loader.error"
        icon="fa-solid fa-exclamation-triangle"
        class="text-danger fa-4x"
      />
      <div class="load" v-else></div>
    </div>
    <p class="mt-3 lead text-muted">{{ loader.message }}</p>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow-y: hidden;
}

.mask {
  overflow-y: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.load {
  height: 50px;
  width: 50px;
  border-radius: 15px;
  background: #41b883;
  animation: loading 2s linear infinite;
}

@keyframes loading {
  0% {
    transform: rotateX(0deg) rotateY(0deg);
  }

  50% {
    transform: rotateX(0deg) rotateY(180deg);
  }

  100% {
    transform: rotateX(180deg) rotateY(180deg);
  }
}
</style>
