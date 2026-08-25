<!-- 系统操作日志页，用于审计上传、删除及管理操作。 -->
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import SearchCard from '@/components/business/search-card.vue';
import { fetchLogs } from '@/service/api';

const rows = ref<Record<string, any>[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const query = reactive({ keyword: '', action: null as string | null, resourceType: null as string | null });
const actionOptions = [
  { label: '上传', value: 'UPLOAD' },
  { label: '删除', value: 'DELETE' }
];
const resourceOptions = [
  { label: '应用', value: 'APP' },
  { label: '版本', value: 'RELEASE' }
];
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
  const result = await fetchLogs({
    page: page.value,
    size: pageSize,
    keyword: query.keyword || undefined,
    action: query.action || undefined,
    resourceType: query.resourceType || undefined
  });
  if (!result.error) {
    rows.value = result.data.records;
    total.value = result.data.total;
  }
  loading.value = false;
}

function search() {
  page.value = 1;
  load();
}

function reset() {
  query.keyword = '';
  query.action = null;
  query.resourceType = null;
  search();
}

onMounted(load);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <SearchCard>
      <NForm :model="query" label-placement="left" label-width="auto">
        <NGrid responsive="screen" item-responsive :x-gap="24" :y-gap="16">
          <NFormItemGi span="24 s:12 m:6" label="日志内容">
            <NInput v-model:value="query.keyword" clearable placeholder="请输入操作人或详情" @keyup.enter="search" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" label="操作类型">
            <NSelect v-model:value="query.action" clearable placeholder="请选择操作类型" :options="actionOptions" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" label="资源类型">
            <NSelect
              v-model:value="query.resourceType"
              clearable
              placeholder="请选择资源类型"
              :options="resourceOptions"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6">
            <NSpace class="w-full" justify="end">
              <NButton @click="reset">
                <template #icon><icon-ic-round-refresh class="text-icon" /></template>
                重置
              </NButton>
              <NButton type="primary" ghost @click="search">
                <template #icon><icon-ic-round-search class="text-icon" /></template>
                搜索
              </NButton>
            </NSpace>
          </NFormItemGi>
        </NGrid>
      </NForm>
    </SearchCard>
    <NCard title="操作日志" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header-extra>
        <NButton size="small" @click="load">
          <template #icon><icon-mdi-refresh class="text-icon" /></template>
          刷新
        </NButton>
      </template>
      <NDataTable size="small" :columns="columns" :data="rows" :loading="loading" :row-key="row => row.id" />
      <NPagination
        v-if="total > pageSize"
        v-model:page="page"
        class="pager"
        :item-count="total"
        :page-size="pageSize"
        @update:page="load"
      />
    </NCard>
  </div>
</template>

<style scoped>
.pager {
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
