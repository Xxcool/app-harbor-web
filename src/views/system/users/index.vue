<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { createUser, fetchRoles, fetchUsers } from '@/service/api';
const rows = ref<Record<string, any>[]>([]);
const roles = ref<Record<string, any>[]>([]);
const loading = ref(false);
const visible = ref(false);
const saving = ref(false);
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
  const [u, r] = await Promise.all([fetchUsers({ page: 1, size: 50 }), fetchRoles()]);
  if (!u.error) rows.value = u.data.records;
  if (!r.error) roles.value = r.data;
  loading.value = false;
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
  <NCard title="用户管理" :bordered="false">
    <template #header-extra><NButton type="primary" @click="visible = true">新增用户</NButton></template>
    <NDataTable :columns="columns" :data="rows" :loading="loading" />
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
  </NCard>
</template>
