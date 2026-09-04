<!-- 系统用户管理页：按照管理模板提供分页、编辑与受保护的删除操作。 -->
<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NTag } from 'naive-ui';
import SearchCard from '@/components/business/search-card.vue';
import { createUser, deleteUser, fetchRoles, fetchUsers, updateUser } from '@/service/api';

type UserRow = {
  id: number;
  username: string;
  displayName: string;
  email?: string;
  status: string;
  createdAt: string;
  roleCodes: string[];
};
const rows = ref<UserRow[]>([]);
const roles = ref<Record<string, any>[]>([]);
const loading = ref(false);
const saving = ref(false);
const visible = ref(false);
const editing = ref<UserRow | null>(null);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const keyword = ref('');
const form = reactive({
  username: '',
  displayName: '',
  email: '',
  password: '',
  roleCodes: [] as string[],
  status: 'ENABLED'
});

function resetForm() {
  Object.assign(form, { username: '', displayName: '', email: '', password: '', roleCodes: [], status: 'ENABLED' });
}
function openCreate() {
  editing.value = null;
  resetForm();
  visible.value = true;
}
function openEdit(row: UserRow) {
  editing.value = row;
  Object.assign(form, {
    username: row.username,
    displayName: row.displayName,
    email: row.email || '',
    password: '',
    roleCodes: [...row.roleCodes],
    status: row.status
  });
  visible.value = true;
}
async function load() {
  loading.value = true;
  const [users, roleResult] = await Promise.all([
    fetchUsers({ page: page.value, size: pageSize.value, keyword: keyword.value || undefined }),
    fetchRoles()
  ]);
  if (!users.error) {
    rows.value = users.data.records as UserRow[];
    total.value = users.data.total;
  }
  if (!roleResult.error) roles.value = roleResult.data;
  loading.value = false;
}
function search() {
  page.value = 1;
  load();
}
function changePageSize(size: number) {
  pageSize.value = size;
  page.value = 1;
  load();
}
function reset() {
  keyword.value = '';
  search();
}
async function submit() {
  if (!form.displayName.trim()) return window.$message?.warning('请输入显示名称');
  if (!editing.value && (!form.username.trim() || form.password.length < 12))
    return window.$message?.warning('用户名不能为空，初始密码至少 12 位');
  saving.value = true;
  const result = editing.value
    ? await updateUser(editing.value.id, {
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        password: form.password,
        roleCodes: form.roleCodes,
        status: form.status
      })
    : await createUser({
        username: form.username.trim(),
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        password: form.password,
        roleCodes: form.roleCodes
      });
  saving.value = false;
  if (!result.error) {
    visible.value = false;
    window.$message?.success(editing.value ? '用户已更新' : '用户创建成功');
    await load();
  }
}
function remove(row: UserRow) {
  window.$dialog?.warning({
    title: '删除用户',
    content: `确定删除用户“${row.username}”吗？此操作不可恢复。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const result = await deleteUser(row.id);
      if (!result.error) {
        window.$message?.success('用户已删除');
        await load();
      }
    }
  });
}
const columns: DataTableColumns<UserRow> = [
  { title: '用户名', key: 'username', minWidth: 120 },
  { title: '显示名称', key: 'displayName', minWidth: 120 },
  { title: '邮箱', key: 'email', minWidth: 170, render: (row: UserRow) => row.email || '--' },
  { title: '角色', key: 'roleCodes', minWidth: 180, render: (row: UserRow) => row.roleCodes.join('、') || '--' },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render: (row: UserRow) =>
      h(NTag, { size: 'small', type: row.status === 'ENABLED' ? 'success' : 'warning' }, () =>
        row.status === 'ENABLED' ? '启用' : '停用'
      )
  },
  { title: '创建时间', key: 'createdAt', width: 178 },
  {
    title: '操作',
    key: 'actions',
    width: 154,
    fixed: 'right',
    render: (row: UserRow) =>
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
          <NFormItemGi span="24 s:16 m:10" label="用户信息">
            <NInput v-model:value="keyword" clearable placeholder="请输入用户名或显示名称" @keyup.enter="search" />
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
    <NCard title="用户列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header-extra>
        <NSpace>
          <NButton size="small" @click="load">
            <template #icon><icon-mdi-refresh class="text-icon" /></template>
            刷新
          </NButton>
          <NButton size="small" type="primary" ghost @click="openCreate">
            <template #icon><icon-ic-round-plus class="text-icon" /></template>
            新增用户
          </NButton>
        </NSpace>
      </template>
      <NDataTable
        size="small"
        :columns="columns"
        :data="rows"
        :loading="loading"
        :row-key="row => row.id"
        :scroll-x="1050"
      />
      <NPagination
        v-if="total > 0"
        v-model:page="page"
        class="pager"
        :item-count="total"
        :page-size="pageSize"
        :prefix="() => `共 ${total} 条`"
        :page-sizes="[10, 20, 30, 50]"
        show-size-picker
        @update:page="load"
        @update:page-size="changePageSize"
      />
    </NCard>
    <NModal v-model:show="visible" preset="card" :title="editing ? '编辑用户' : '新增用户'" class="max-w-560px">
      <NForm label-placement="left" label-width="88" :show-feedback="false">
        <NGrid cols="1" :y-gap="16">
          <NFormItemGi label="用户名" required>
            <NInput v-model:value="form.username" :disabled="Boolean(editing)" />
          </NFormItemGi>
          <NFormItemGi label="显示名称" required><NInput v-model:value="form.displayName" /></NFormItemGi>
          <NFormItemGi label="邮箱"><NInput v-model:value="form.email" placeholder="可选" /></NFormItemGi>
          <NFormItemGi :label="editing ? '重置密码' : '初始密码'" :required="!editing">
            <NInput
              v-model:value="form.password"
              type="password"
              show-password-on="click"
              :placeholder="editing ? '留空则不修改' : '至少 12 位'"
            />
          </NFormItemGi>
          <NFormItemGi label="角色">
            <NSelect
              v-model:value="form.roleCodes"
              multiple
              :options="roles.map(role => ({ label: role.name, value: role.code }))"
            />
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
      <template #action>
        <NSpace justify="end">
          <NButton @click="visible = false">取消</NButton>
          <NButton type="primary" :loading="saving" @click="submit">确认</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.pager {
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
