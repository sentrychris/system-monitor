<script setup lang="ts">
import { ref, onMounted } from "vue";
import { map } from "@/utilities/color-map";

const color = ref('white')
const props = defineProps<{
  title: string;
  bg: string;
}>();

onMounted(() => color.value = map[props.bg])
</script>

<template>
    <div :class="`card border-0 shadow-lg bg-${bg} text-${color}`">
        <div class="card-header border-0">
            <div class="d-flex justify-content-between align-items-center">
                <slot name="icon"></slot>
                <p>{{ title }}</p>
            </div>
        </div>
        <div class="card-body">
            <slot name="detail"></slot>
        </div>
    </div>
</template>