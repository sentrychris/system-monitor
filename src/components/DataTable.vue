<script setup lang="ts">
import { ref, watch, computed, onMounted, type Ref } from "vue";
import { orderBy } from "lodash";

const props = defineProps<{
  type: string;
  data: any;
  nested?: boolean;
  sortKey?: string;
  sortOrder?: string;
  excludeColumns?: Array<string>;
}>();

const tableData = ref(props.data);
const tableSortKey = ref("mem");
const tableSortOrder: Ref<"asc" | "desc"> = ref("desc");

const formatHeader = (header: string) => {
  header = header.charAt(0).toUpperCase() + header.slice(1);
  return header.replace("_", " ");
};

const getFilteredHeaders = (headers: string[]) => {
  if (props.excludeColumns && props.excludeColumns.length > 0) {
    return headers.filter((header) => !props.excludeColumns?.includes(header));
  }
  return headers;
};

const changeOrder = (key: string) => {
  tableSortKey.value = key;
  tableSortOrder.value = tableSortOrder.value === "asc" ? "desc" : "asc";
  tableData.value = orderBy(tableData.value, key, tableSortOrder.value);
};

const transpose = () => {
  const response: Array<{ header: string; value: string }> = [];

  for (const key in tableData) {
    let value = tableData[key as keyof typeof tableData];

    if (Number.isInteger(value)) {
      value = parseFloat(tableData[key as keyof typeof tableData]).toFixed(2);
    }

    response.push({
      header: formatHeader(key),
      value,
    });
  }

  return response;
};

const verticalData = computed(() => {
  const data = transpose();
  return orderBy(data, props.sortKey, tableSortOrder.value);
});

onMounted(() => {
  watch(
    () => props.data,
    () => {
      tableData.value = props.data;
    },
  );
});
</script>

<template>
  <table
    v-if="type === 'vertical'"
    class="table table-sm table-borderless table-responsive"
  >
    <tr v-for="(content, key) in verticalData" :key="key">
      <th>{{ content.header }}</th>
      <td>{{ content.value }}</td>
    </tr>
  </table>

  <table v-else class="table table-sm table-striped table-responsive-sm">
    <thead>
      <tr v-if="nested">
        <th
          class="cursor-pointer"
          v-for="(header, key) in getFilteredHeaders(Object.keys(tableData))"
          :key="key"
          @click="changeOrder(header)"
        >
          <span class="me-1">
            <font-awesome-icon
              v-if="tableSortOrder === 'asc' && tableSortKey === header"
              icon="fa-solid fa-caret-up"
            />
            <font-awesome-icon v-else icon="fa-solid fa-caret-down" />
          </span>
          {{ formatHeader(header) }}
        </th>
      </tr>
      <tr v-else>
        <th
          class="cursor-pointer"
          v-for="(header, key) in getFilteredHeaders(Object.keys(tableData[0]))"
          :key="key"
          @click="changeOrder(header)"
        >
          <span class="me-1 indicators">
            <font-awesome-icon
              v-if="tableSortOrder === 'asc' && tableSortKey === header"
              :class="{ active: tableSortKey === header }"
              icon="fa-solid fa-caret-up"
            />
            <font-awesome-icon
              v-else
              :class="{ active: tableSortKey === header }"
              icon="fa-solid fa-caret-down"
            />
          </span>
          {{ formatHeader(header) }}
        </th>
      </tr>
    </thead>
    <tbody v-if="nested">
      <tr>
        <td
          v-for="(object, key) in getFilteredHeaders(Object.keys(tableData))"
          :key="key"
        >
          {{ tableData[object] }}
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr v-for="(object, key) in tableData" :key="key">
        <td
          v-for="(content, index) in getFilteredHeaders(Object.keys(object))"
          :key="index"
        >
          {{ object[content] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
