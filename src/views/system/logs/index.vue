<!-- 系统操作日志页，用于审计上传、删除及管理操作。 -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchLogs } from '@/service/api';

const rows = ref<Record<string, any>[]>([]);
const columns = [
  { title: '操作人', key: 'username' },
  { title: '动作', key: 'action' },
  { title: '资源', key: 'resourceType' },
  { title: '详情', key: 'detail' },
  { title: 'IP', key: 'ip' },
  { title: '时间', key: 'createdAt' }
];

onMounted(async () => {
  const result = await fetchLogs({ page: 1, size: 50 });
  if (!result.error) rows.value = result.data.records;
});
</script>

<template>
  <NCard title="操作日志" :bordered="false">
    <NDataTable :columns="columns" :data="rows" />
  </NCard>
</template>
