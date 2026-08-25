<!-- 业务列表通用查询卡片，统一搜索区域的折叠交互与标题样式。 -->
<script setup lang="ts">
import { ref } from 'vue';

defineOptions({ name: 'SearchCard' });

withDefaults(defineProps<{ title?: string }>(), { title: '搜索' });

const expanded = ref(true);
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <template #header>
      <button class="search-header" type="button" @click="expanded = !expanded">
        <SvgIcon icon="mdi:chevron-down" class="search-arrow" :class="{ collapsed: !expanded }" />
        <span>{{ title }}</span>
      </button>
    </template>
    <NCollapseTransition :show="expanded">
      <slot />
    </NCollapseTransition>
  </NCard>
</template>

<style scoped>
.search-header {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  gap: 6px;
  font: inherit;
}
.search-arrow {
  transition: transform 0.2s ease;
}
.search-arrow.collapsed {
  transform: rotate(-90deg);
}
</style>
