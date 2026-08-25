<!-- 系统角色列表页，角色数据量较小时在前端完成基础筛选。 -->
<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NTag } from 'naive-ui';
import SearchCard from '@/components/business/search-card.vue';
import { createRole, fetchRoles } from '@/service/api';
const rows = ref<Record<string, any>[]>([]);
const visible = ref(false);
const loading = ref(false);
const keyword = ref('');
const form = reactive({ code: '', name: '', description: '' });
const columns = [
  { title: '角色编码', key: 'code' },
  { title: '角色名称', key: 'name' },
  { title: '说明', key: 'description' },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: Record<string, any>) =>
      h(NTag, { size: 'small', type: row.status === 'ENABLED' ? 'success' : 'warning' }, () =>
        row.status === 'ENABLED' ? '启用' : '停用'
      )
  }
];
async function load() {
  loading.value = true;
  const r = await fetchRoles();
  if (!r.error) rows.value = r.data;
  loading.value = false;
}
const filteredRows = computed(() => {
  const value = keyword.value.trim().toLowerCase();
  if (!value) return rows.value;
  return rows.value.filter(row => `${row.name} ${row.code}`.toLowerCase().includes(value));
});
function reset() {
  keyword.value = '';
}
function search() {
  keyword.value = keyword.value.trim();
}
async function submit() {
  if (!form.code || !form.name) return window.$message?.warning('请填写角色编码和名称');
  const r = await createRole(form);
  if (!r.error) {
    visible.value = false;
    window.$message?.success('角色创建成功');
    await load();
  }
}
onMounted(load);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <SearchCard>
      <NForm label-placement="left" label-width="auto">
        <NGrid responsive="screen" item-responsive :x-gap="24" :y-gap="16">
          <NFormItemGi span="24 s:16 m:10" label="角色信息">
            <NInput v-model:value="keyword" clearable placeholder="请输入角色名称或编码" @keyup.enter="search" />
          </NFormItemGi>
          <NFormItemGi span="24 s:8 m:14">
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
    <NCard title="角色列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header-extra>
        <NSpace>
          <NButton size="small" @click="load">
            <template #icon><icon-mdi-refresh class="text-icon" /></template>
            刷新
          </NButton>
          <NButton size="small" type="primary" ghost @click="visible = true">
            <template #icon><icon-ic-round-plus class="text-icon" /></template>
            新增角色
          </NButton>
        </NSpace>
      </template>
      <NDataTable size="small" :columns="columns" :data="filteredRows" :loading="loading" :row-key="row => row.id" />
    </NCard>
    <NModal v-model:show="visible" preset="card" title="新增角色" class="max-w-520px">
      <NForm label-placement="top">
        <NFormItem label="角色编码"><NInput v-model:value="form.code" placeholder="例如 RELEASE_AUDITOR" /></NFormItem>
        <NFormItem label="角色名称"><NInput v-model:value="form.name" /></NFormItem>
        <NFormItem label="说明"><NInput v-model:value="form.description" type="textarea" /></NFormItem>
      </NForm>
      <NButton block type="primary" @click="submit">创建角色</NButton>
    </NModal>
  </div>
</template>
