<script setup lang="ts">
import { map } from "@/utilities/color-map";

const props = defineProps<{
  title: string;
  bg: string;
  loading: boolean;
}>();

const color = map[props.bg]
</script>

<template>
    <div :class="`card border-0 shadow-lg bg-${bg} text-${color} flex-fill`">
        <div class="card-header border-0">
            <div class="d-flex justify-content-between align-items-center">
                <slot name="icon"></slot>
                <p>{{ title }}</p>
            </div>
        </div>
        <div class="card-body">
            <slot v-if="!loading" name="detail"></slot>
            <div v-else>Loading...</div>
        </div>
    </div>
</template>