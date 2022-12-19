<script setup lang="ts">
import { mapTextContrast } from "@/utilities/color-map";
import { useLoadingStore } from "@/stores/loading";

const props = defineProps<{
  title: string;
  icon?: string;
  bg: string;
}>();

const color = mapTextContrast[props.bg]
const loading = useLoadingStore()
</script>

<template>
    <div :class="`card border-0 shadow-lg bg-${bg} text-${color} flex-fill`">
        <div :class="`card-header border-0 bg-${bg}`">
            <div class="d-flex justify-content-start align-items-center gap-3">
                <font-awesome-icon v-if="icon" class="fa-3x" :icon="icon" />
                <p class="lead">{{ title }}</p>
            </div>
        </div>
        <div class="card-body">
            <slot v-if="!loading.status" name="detail"></slot>
            <div v-else>Loading...</div>
        </div>
    </div>
</template>