<script setup lang="ts">
import { map } from "@/utilities/color-map";
import { useLoadingStore } from "@/stores/loading";

const props = defineProps<{
  title: string;
  icon?: string;
  bg: string;
}>();

const color = map[props.bg]
const loading = useLoadingStore()
</script>

<template>
    <div :class="`card border-0 shadow-lg bg-${bg} text-${color} flex-fill`">
        <div class="card-header border-0">
            <div class="d-flex justify-content-between align-items-center">
                <font-awesome-icon v-if="icon" :icon="icon"></font-awesome-icon>
                <p>{{ title }}</p>
            </div>
        </div>
        <div class="card-body">
            <slot v-if="!loading.status" name="detail"></slot>
            <div v-else>Loading...</div>
        </div>
    </div>
</template>