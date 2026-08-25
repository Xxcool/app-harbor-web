<!-- 系统操作日志页，用于审计上传、删除及管理操作。 -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchLogs } from '@/service/api';

const rows = ref<Record<string, any>[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const columns = [
  { title: '操作人', key: 'username' },
  { title: '动作', key: 'action' },
  { title: '资源', key: 'resourceType' },
  { title: '详情', key: 'detail' },
  { title: 'IP', key: 'ip' },
  { title: '时间', key: 'createdAt' }
];

async function load() {
  loading.value = true;
  const result = await fetchLogs({ page: page.value, size: pageSize });
  if (!result.error) {
    rows.value = result.data.records;
    total.value = result.data.total;
  }
  loading.value = false;
}

onMounted(load);
</script>

<template>
  <NCard title="操作日志" :bordered="false">
    <NDataTable :columns="columns" :data="rows" :loading="loading" :row-key="row => row.id" />
    <NPagination
      v-if="total > pageSize"
      v-model:page="page"
      class="pager"
      :item-count="total"
      :page-size="pageSize"
      @update:page="load"
    />
  </NCard>
</template>

<style scoped>
.pager {
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
