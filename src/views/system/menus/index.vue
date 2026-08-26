<!-- 动态菜单配置展示页：仅消费后端路由树，不在首期提供菜单编辑能力。 -->
<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NTag } from 'naive-ui';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { fetchSystemMenus } from '@/service/api';
import type { SystemMenu } from '@/service/api/app-publish';
import { $t } from '@/locales';

interface MenuRow {
  id: string;
  menuName: string;
  menuType: 'DIRECTORY' | 'MENU';
  icon?: string;
  routeName: string;
  routePath: string;
  hidden: boolean;
  parentId: string;
  sort: number;
  children?: MenuRow[];
}

const rows = ref<MenuRow[]>([]);
const loading = ref(false);

function toRows(menus: SystemMenu[], parentId = '0'): MenuRow[] {
  return menus.map(menu => ({
    id: menu.id,
    menuName: menu.meta.i18nKey ? $t(menu.meta.i18nKey as App.I18n.I18nKey) : menu.meta.title,
    menuType: menu.children?.length ? 'DIRECTORY' : 'MENU',
    icon: menu.meta.icon,
    routeName: menu.name,
    routePath: menu.path,
    hidden: Boolean(menu.meta.hideInMenu),
    parentId,
    sort: Number(menu.meta.order || 0),
    children: menu.children ? toRows(menu.children, menu.id) : undefined
  }));
}

const columns: DataTableColumns<MenuRow> = [
  { title: 'ID', key: 'id', width: 150 },
  {
    title: '菜单类型',
    key: 'menuType',
    width: 108,
    render: row =>
      h(NTag, { size: 'small', type: row.menuType === 'DIRECTORY' ? 'info' : 'primary' }, () =>
        row.menuType === 'DIRECTORY' ? '目录' : '菜单'
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
    render: () => h(NTag, { size: 'small', type: 'success' }, () => '启用')
  },
  {
    title: '隐藏菜单',
    key: 'hidden',
    width: 100,
    render: row => h(NTag, { size: 'small', type: row.hidden ? 'error' : 'default' }, () => (row.hidden ? '是' : '否'))
  },
  { title: '父级菜单 ID', key: 'parentId', width: 130 },
  { title: '排序', key: 'sort', width: 72, align: 'center' }
];

async function load() {
  loading.value = true;
  const result = await fetchSystemMenus();
  if (!result.error) rows.value = toRows(result.data);
  loading.value = false;
}

onMounted(load);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
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
        :scroll-x="1320"
      />
    </NCard>
  </div>
</template>
