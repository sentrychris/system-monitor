<script setup lang="ts">
import { ref, computed, type Ref } from "vue";
import _ from "lodash";

const props = defineProps<{
  type: string,
  data: any, // change
  nested?: boolean,
  sortKey?: string,
  sortOrder?: 'asc' | 'desc'
}>();

const tableData = ref(props.data)
const tableOrder: Ref<'asc'|'desc'> = ref('asc')

const vertical = computed(() => {
  const response: Array<{header: string, value: string}> = [];

  for (const key in tableData) {
    if (Number.isInteger(tableData[key])) {
      tableData[key] = parseFloat(tableData[key]).toFixed(2);
    }

    response.push({
      header: formatHeader(key),
      value: tableData[key]
    });
  }

  return _.orderBy(response, props.sortKey, props.sortOrder);
})

const changeOrder = (key: string) => {
  tableOrder.value = tableOrder.value === 'asc' ? 'desc' : 'asc'
  tableData.value = _.orderBy(tableData.value, key, tableOrder.value)
}

const formatHeader = (header: string) => {
  header = header.charAt(0).toUpperCase() + header.slice(1);
  return header.replace('_', ' ');
}
</script>

<template>
  <table v-if="type === 'vertical'" class="table table-sm table-borderless table-responsive">
    <tr v-for="(content, key) in vertical" :key="key">
      <th>{{ content.header }}</th>
      <td>{{ content.value }}</td>
    </tr>
  </table>

  <table v-else class="table table-sm table-striped table-responsive-sm">
    <thead>
      <tr v-if="nested">
        <th v-for="(header, key) in Object.keys(tableData)" :key="key">
          {{ formatHeader(header) }}
        </th>
      </tr>
      <tr v-else>
        <th v-for="(header, key) in Object.keys(tableData[0])" :key="key" @click="changeOrder(header)">
          {{ formatHeader(header) }}
        </th>
      </tr>
    </thead>
    <tbody v-if="nested">
      <tr>
        <td v-for="(object, key) in tableData" :key="key">{{ object }}</td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr v-for="(object, key) in tableData" :key="key">
        <td v-for="(content, index) in object" :key="index">{{ content }}</td>
      </tr>
    </tbody>
  </table>
</template>