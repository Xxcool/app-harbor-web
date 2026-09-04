<!-- 系统角色管理页：支持角色的维护与安全删除。 -->
<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NTag } from 'naive-ui';
import SearchCard from '@/components/business/search-card.vue';
import { createRole, deleteRole, fetchRoles, updateRole } from '@/service/api';

type RoleRow = { id: number; code: string; name: string; description?: string; status: string };
const rows = ref<RoleRow[]>([]);
const visible = ref(false);
const loading = ref(false);
const saving = ref(false);
const keyword = ref('');
const editing = ref<RoleRow | null>(null);
const form = reactive({ code: '', name: '', description: '', status: 'ENABLED' });
const filteredRows = computed(() => {
  const value = keyword.value.trim().toLowerCase();
  return value ? rows.value.filter(row => `${row.name} ${row.code}`.toLowerCase().includes(value)) : rows.value;
});
function openCreate() {
  editing.value = null;
  Object.assign(form, { code: '', name: '', description: '', status: 'ENABLED' });
  visible.value = true;
}
function openEdit(row: RoleRow) {
  editing.value = row;
  Object.assign(form, { code: row.code, name: row.name, description: row.description || '', status: row.status });
  visible.value = true;
}
async function load() {
  loading.value = true;
  const result = await fetchRoles();
  if (!result.error) rows.value = result.data as RoleRow[];
  loading.value = false;
}
function reset() {
  keyword.value = '';
}
function search() {
  keyword.value = keyword.value.trim();
}
async function submit() {
  if (!form.name.trim() || (!editing.value && !form.code.trim()))
    return window.$message?.warning('请填写角色编码和名称');
  saving.value = true;
  const result = editing.value
    ? await updateRole(editing.value.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status
      })
    : await createRole({ code: form.code.trim(), name: form.name.trim(), description: form.description.trim() });
  saving.value = false;
  if (!result.error) {
    visible.value = false;
    window.$message?.success(editing.value ? '角色已更新' : '角色创建成功');
    await load();
  }
}
function remove(row: RoleRow) {
  window.$dialog?.warning({
    title: '删除角色',
    content: `确定删除角色“${row.name}”吗？仍被用户使用的角色不能删除。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const result = await deleteRole(row.id);
      if (!result.error) {
        window.$message?.success('角色已删除');
        await load();
      }
    }
  });
}
const columns: DataTableColumns<RoleRow> = [
  { title: '角色编码', key: 'code', minWidth: 160 },
  { title: '角色名称', key: 'name', minWidth: 140 },
  { title: '说明', key: 'description', minWidth: 240 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: RoleRow) =>
      h(NTag, { size: 'small', type: row.status === 'ENABLED' ? 'success' : 'warning' }, () =>
        row.status === 'ENABLED' ? '启用' : '停用'
      )
  },
  {
    title: '操作',
    key: 'actions',
    width: 154,
    fixed: 'right',
    render: (row: RoleRow) =>
      h('div', { class: 'flex-center gap-8px' }, [
        h(
          NButton,
          { size: 'small', type: 'primary', ghost: true, onClick: () => openEdit(row) },
          { default: () => '编辑' }
        ),
        h(NButton, { size: 'small', type: 'error', ghost: true, onClick: () => remove(row) }, { default: () => '删除' })
      ])
  }
];
onMounted(load);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden p-16px lt-sm:overflow-auto">
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
          <NButton size="small" type="primary" ghost @click="openCreate">
            <template #icon><icon-ic-round-plus class="text-icon" /></template>
            新增角色
          </NButton>
        </NSpace>
      </template>
      <NDataTable
        size="small"
        :columns="columns"
        :data="filteredRows"
        :loading="loading"
        :row-key="row => row.id"
        :scroll-x="800"
      />
    </NCard>
    <NModal v-model:show="visible" preset="card" :title="editing ? '编辑角色' : '新增角色'" class="max-w-520px">
      <NForm label-placement="left" label-width="80" :show-feedback="false">
        <NGrid cols="1" :y-gap="16">
          <NFormItemGi label="角色编码" required>
            <NInput v-model:value="form.code" :disabled="Boolean(editing)" placeholder="例如 RELEASE_AUDITOR" />
          </NFormItemGi>
          <NFormItemGi label="角色名称" required><NInput v-model:value="form.name" /></NFormItemGi>
          <NFormItemGi label="说明">
            <NInput v-model:value="form.description" type="textarea" :autosize="{ minRows: 3 }" />
          </NFormItemGi>
          <NFormItemGi v-if="editing" label="状态">
            <NRadioGroup v-model:value="form.status">
              <NSpace>
                <NRadio value="ENABLED">启用</NRadio>
                <NRadio value="DISABLED">停用</NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
        </NGrid>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="visible = false">取消</NButton>
          <NButton type="primary" :loading="saving" @click="submit">确认</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
