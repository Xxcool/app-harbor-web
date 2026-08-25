<!-- 应用分页列表页，按模板标准拆分查询区域与列表区域。 -->
<script setup lang="tsx">
import { onMounted, reactive, ref } from 'vue';
import { NButton, NTag } from 'naive-ui';
import SearchCard from '@/components/business/search-card.vue';
import { useRouterPush } from '@/hooks/common/router';
import { fetchApps } from '@/service/api';
import type { AndroidApp } from '@/service/api/app-publish';

const { routerPush } = useRouterPush(false);
const rows = ref<AndroidApp[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const query = reactive({ appName: '', packageName: '', status: null as string | null });
const statusOptions = [{ label: '运行中', value: 'ENABLED' }, { label: '已停用', value: 'DISABLED' }];
const columns = [{ title: '应用', key: 'appName', render: (row: AndroidApp) => <div class="app-cell"><div class="app-list-icon">{row.iconUrl ? <img src={row.iconUrl} alt={row.appName} /> : row.appName.slice(0, 1)}</div><div><b>{row.appName}</b><code>{row.packageName}</code></div></div> }, { title: '状态', key: 'status', width: 110, render: (row: AndroidApp) => <NTag type={row.status === 'ENABLED' ? 'success' : 'default'} round>{row.status === 'ENABLED' ? '运行中' : '已停用'}</NTag> }, { title: '最近更新', key: 'updatedAt', width: 180, render: (row: AndroidApp) => new Date(row.updatedAt).toLocaleString() }, { title: '', key: 'action', width: 110, render: (row: AndroidApp) => <NButton text type="primary" onClick={() => routerPush(`/release/apps-detail/${row.id}`)}>版本档案 →</NButton> }];
async function load() {
  loading.value = true;
  const result = await fetchApps({
    page: page.value,
    size: pageSize,
    appName: query.appName || undefined,
    packageName: query.packageName || undefined,
    status: query.status || undefined
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
  query.appName = '';
  query.packageName = '';
  query.status = null;
  search();
}

onMounted(load);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <SearchCard>
      <NForm :model="query" label-placement="left" label-width="auto">
        <NGrid responsive="screen" item-responsive :x-gap="24" :y-gap="16">
          <NFormItemGi span="24 s:12 m:6" label="应用名称">
            <NInput v-model:value="query.appName" clearable placeholder="请输入应用名称" @keyup.enter="search" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" label="安卓包名">
            <NInput v-model:value="query.packageName" clearable placeholder="请输入安卓包名" @keyup.enter="search" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" label="应用状态">
            <NSelect v-model:value="query.status" clearable placeholder="请选择应用状态" :options="statusOptions" />
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
    <NCard title="应用列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <div class="mb-16px flex justify-end gap-12px">
        <NButton @click="load">刷新</NButton>
        <NButton type="primary" @click="routerPush('/release/upload')">上传 APK</NButton>
      </div>
      <NDataTable size="small" :columns="columns" :data="rows" :loading="loading" :row-key="row => row.id" />
      <NPagination
        v-if="total > 0"
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
:deep(.app-cell) {
  display: flex;
  align-items: center;
  gap: 10px;
}
:deep(.app-cell > div:last-child) {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
:deep(.app-cell code) {
  color: #849088;
  font-size: 12px;
}
:deep(.app-list-icon) {
  display: grid;
  width: 40px;
  height: 40px;
  overflow: hidden;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  background: #e9f6cf;
  font-weight: 800;
}
:deep(.app-list-icon img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
