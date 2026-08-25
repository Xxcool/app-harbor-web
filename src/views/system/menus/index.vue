<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { TreeOption } from 'naive-ui';
import { fetchSystemMenus } from '@/service/api';
import type { SystemMenu } from '@/service/api/app-publish';
import { $t } from '@/locales';

const menuTree = ref<TreeOption[]>([]);
const loading = ref(false);

function toTree(menus: SystemMenu[]): TreeOption[] {
  return menus.map(menu => ({
    key: menu.id,
    label: menu.meta.i18nKey ? $t(menu.meta.i18nKey as App.I18n.I18nKey) : menu.meta.title,
    suffix: () => menu.path,
    children: menu.children ? toTree(menu.children) : undefined
  }));
}

async function load() {
  loading.value = true;
  const result = await fetchSystemMenus();
  if (!result.error) menuTree.value = toTree(result.data);
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
      <NTree block-line :data="menuTree" default-expand-all />
    </NCard>
  </div>
</template>
