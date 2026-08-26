<!-- 系统菜单管理页：展示持久化菜单树，并只开放不影响路由安全的展示属性编辑。 -->
<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NTag } from 'naive-ui';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { deleteSystemMenu, fetchSystemMenus, updateSystemMenu } from '@/service/api';
import type { SystemMenu } from '@/service/api/app-publish';

const rows = ref<SystemMenu[]>([]);
const loading = ref(false);
const submitting = ref(false);
const visible = ref(false);
const editing = ref<SystemMenu | null>(null);
const form = reactive({ menuName: '', icon: '', order: 0, status: '1' as '0' | '1', hideInMenu: 0 });

function openEdit(row: SystemMenu) {
  editing.value = row;
  form.menuName = row.menuName;
  form.icon = row.icon || '';
  form.order = row.order;
  form.status = row.status;
  form.hideInMenu = row.hideInMenu;
  visible.value = true;
}

async function load() {
  loading.value = true;
  const result = await fetchSystemMenus();
  if (!result.error) rows.value = result.data;
  loading.value = false;
}

async function submit() {
  if (!editing.value) return;
  if (!form.menuName.trim()) return window.$message?.warning('请输入菜单名称');
  submitting.value = true;
  const result = await updateSystemMenu(editing.value.id, {
    menuName: form.menuName.trim(),
    icon: form.icon.trim(),
    order: form.order,
    status: form.status,
    hideInMenu: form.hideInMenu
  });
  submitting.value = false;
  if (!result.error) {
    window.$message?.success('菜单已更新');
    visible.value = false;
    await load();
  }
}

function remove(row: SystemMenu) {
  window.$dialog?.warning({
    title: '删除菜单',
    content: `确定删除“${row.menuName}”吗？删除后不可恢复。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const result = await deleteSystemMenu(row.id);
      if (!result.error) {
        window.$message?.success('菜单已删除');
        await load();
      }
    }
  });
}

const columns: DataTableColumns<SystemMenu> = [
  { title: 'ID', key: 'id', width: 84, align: 'center' },
  {
    title: '菜单类型',
    key: 'menuType',
    width: 108,
    render: row =>
      h(NTag, { size: 'small', type: row.menuType === '1' ? 'default' : 'primary' }, () =>
        row.menuType === '1' ? '目录' : '菜单'
      )
  },
  { title: '菜单名称', key: 'menuName', minWidth: 140 },
  {
    title: '图标',
    key: 'icon',
    width: 76,
    align: 'center',
    render: row => (row.icon ? h(SvgIcon, { icon: row.icon, class: 'text-18px text-primary' }) : '--')
  },
  { title: '路由名称', key: 'routeName', minWidth: 150 },
  { title: '路由路径', key: 'routePath', minWidth: 180 },
  {
    title: '菜单状态',
    key: 'status',
    width: 100,
    render: row =>
      h(NTag, { size: 'small', type: row.status === '1' ? 'success' : 'warning' }, () =>
        row.status === '1' ? '启用' : '禁用'
      )
  },
  {
    title: '隐藏菜单',
    key: 'hideInMenu',
    width: 100,
    render: row =>
      h(NTag, { size: 'small', type: row.hideInMenu ? 'error' : 'default' }, () => (row.hideInMenu ? '是' : '否'))
  },
  { title: '父级菜单 ID', key: 'parentId', width: 130 },
  { title: '排序', key: 'order', width: 72, align: 'center' },
  {
    title: '操作',
    key: 'actions',
    width: 154,
    fixed: 'right',
    render: row =>
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
    <NCard title="菜单列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header-extra>
        <NButton size="small" :loading="loading" @click="load">
          <template #icon><icon-mdi-refresh class="text-icon" /></template>
          刷新
        </NButton>
      </template>
      <NDataTable
        size="small"
        :columns="columns"
        :data="rows"
        :loading="loading"
        :row-key="row => row.id"
        :default-expanded-row-keys="rows.map(row => row.id)"
        :scroll-x="1380"
      />
    </NCard>

    <NModal v-model:show="visible" preset="card" title="编辑菜单" class="max-w-760px">
      <NForm label-placement="left" label-width="92" :show-feedback="false">
        <NGrid :x-gap="24" :y-gap="16" cols="2">
          <NFormItemGi label="菜单类型">
            <NInput :value="editing?.menuType === '1' ? '目录' : '菜单'" disabled />
          </NFormItemGi>
          <NFormItemGi label="菜单名称" required>
            <NInput v-model:value="form.menuName" maxlength="32" show-count />
          </NFormItemGi>
          <NFormItemGi label="路由名称"><NInput :value="editing?.routeName" disabled /></NFormItemGi>
          <NFormItemGi label="路由路径"><NInput :value="editing?.routePath" disabled /></NFormItemGi>
          <NFormItemGi label="页面组件"><NInput :value="editing?.component" disabled /></NFormItemGi>
          <NFormItemGi label="国际化 Key"><NInput :value="editing?.i18nKey" disabled /></NFormItemGi>
          <NFormItemGi label="排序">
            <NInputNumber v-model:value="form.order" class="w-full" :min="0" :precision="0" />
          </NFormItemGi>
          <NFormItemGi label="图标">
            <NInput v-model:value="form.icon" placeholder="例如 ph:app-window-bold" />
          </NFormItemGi>
          <NFormItemGi label="菜单状态">
            <NRadioGroup v-model:value="form.status">
              <NSpace>
                <NRadio value="1">启用</NRadio>
                <NRadio value="0">禁用</NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi label="隐藏菜单">
            <NRadioGroup v-model:value="form.hideInMenu">
              <NSpace>
                <NRadio :value="0">否</NRadio>
                <NRadio :value="1">是</NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
        </NGrid>
      </NForm>
      <NSpace justify="end" class="mt-20px">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="submit">确认</NButton>
      </NSpace>
    </NModal>
  </div>
</template>
