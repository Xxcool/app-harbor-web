<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import SearchCard from '@/components/business/search-card.vue';
import { createUser, fetchRoles, fetchUsers } from '@/service/api';
const rows = ref<Record<string, any>[]>([]);
const roles = ref<Record<string, any>[]>([]);
const loading = ref(false);
const visible = ref(false);
const saving = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const keyword = ref('');
const form = reactive({ username: '', displayName: '', email: '', password: '', roleCodes: [] as string[] });
const columns = [
  { title: '用户名', key: 'username' },
  { title: '显示名称', key: 'displayName' },
  { title: '邮箱', key: 'email' },
  { title: '状态', key: 'status' },
  { title: '创建时间', key: 'createdAt' }
];
async function load() {
  loading.value = true;
  const [u, r] = await Promise.all([
    fetchUsers({ page: page.value, size: pageSize, keyword: keyword.value || undefined }),
    fetchRoles()
  ]);
  if (!u.error) {
    rows.value = u.data.records;
    total.value = u.data.total;
  }
  if (!r.error) roles.value = r.data;
  loading.value = false;
}
function search() {
  page.value = 1;
  load();
}
function reset() {
  keyword.value = '';
  search();
}
async function submit() {
  if (!form.username || !form.displayName || form.password.length < 12)
    return window.$message?.warning('请完整填写用户信息，密码至少 12 位');
  saving.value = true;
  const r = await createUser(form);
  saving.value = false;
  if (!r.error) {
    visible.value = false;
    window.$message?.success('用户创建成功');
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
          <NButton size="small" type="primary" ghost @click="visible = true">
            <template #icon><icon-ic-round-plus class="text-icon" /></template>
            新增用户
          </NButton>
        </NSpace>
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
    <NModal v-model:show="visible" preset="card" title="新增用户" class="max-w-520px">
      <NForm label-placement="top">
        <NFormItem label="用户名"><NInput v-model:value="form.username" /></NFormItem>
        <NFormItem label="显示名称"><NInput v-model:value="form.displayName" /></NFormItem>
        <NFormItem label="邮箱"><NInput v-model:value="form.email" /></NFormItem>
        <NFormItem label="初始密码">
          <NInput v-model:value="form.password" type="password" show-password-on="click" />
        </NFormItem>
        <NFormItem label="角色">
          <NSelect
            v-model:value="form.roleCodes"
            multiple
            :options="roles.map(r => ({ label: r.name, value: r.code }))"
          />
        </NFormItem>
      </NForm>
      <NButton block type="primary" :loading="saving" @click="submit">创建用户</NButton>
    </NModal>
  </div>
</template>

<style scoped>
.pager {
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
