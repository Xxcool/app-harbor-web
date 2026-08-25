<script setup lang="tsx">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NSpace } from 'naive-ui';
import { deleteApp, deleteRelease, fetchApp, fetchReleases } from '@/service/api';
import type { AndroidApp, AndroidRelease } from '@/service/api/app-publish';
import { useRouterPush } from '@/hooks/common/router';
import { useAuthStore } from '@/store/modules/auth';

const route = useRoute();
const { routerPush } = useRouterPush();
const authStore = useAuthStore();
const id = computed(() => Number(route.params.id));
const app = ref<AndroidApp>();
const releases = ref<AndroidRelease[]>([]);
const loading = ref(false);
const showDeleteApp = ref(false);
const deleteAppName = ref('');
const deletingApp = ref(false);
const serviceBaseUrl = import.meta.env.VITE_SERVICE_BASE_URL;
const canDelete = computed(() => authStore.userInfo.roles.some(role => ['R_SUPER', 'R_APP_MANAGER'].includes(role)));

const columns = [
  { title: '版本', key: 'versionName', render: (r: AndroidRelease) => <div class="version-cell"><b>{r.versionName}</b><code>code {r.versionCode} · build {r.buildNo}</code></div> },
  { title: '大小', key: 'fileSize', width: 100, render: (r: AndroidRelease) => `${(r.fileSize / 1024 / 1024).toFixed(1)} MB` },
  { title: '下载', key: 'downloadCount', width: 90 },
  { title: '上传时间', key: 'createdAt', width: 170, render: (r: AndroidRelease) => new Date(r.createdAt).toLocaleString() },
  { title: '操作', key: 'action', width: 170, render: (r: AndroidRelease) => <NSpace size={8}><a href={`${serviceBaseUrl}/download/releases/${r.id}`}><NButton ghost type="primary" size="small">下载</NButton></a>{canDelete.value && <NButton ghost type="error" size="small" onClick={() => confirmDeleteRelease(r)}>删除</NButton>}</NSpace> }
];

async function load() {
  loading.value = true;
  const [a, r] = await Promise.all([fetchApp(id.value), fetchReleases(id.value, { page: 1, size: 100 })]);
  if (!a.error) app.value = a.data;
  if (!r.error) releases.value = r.data.records;
  loading.value = false;
}

function confirmDeleteRelease(release: AndroidRelease) {
  window.$dialog?.warning({
    title: '删除版本',
    content: `确认删除 ${release.versionName}（code ${release.versionCode}）？APK 文件及版本记录将一并删除，且无法恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { error } = await deleteRelease(release.id);
      if (!error) { window.$message?.success('版本已删除'); await load(); }
    }
  });
}

async function handleDeleteApp() {
  if (!app.value || deleteAppName.value.trim() !== app.value.appName) return;
  deletingApp.value = true;
  const { error } = await deleteApp(app.value.id);
  deletingApp.value = false;
  if (!error) { window.$message?.success('应用及其全部版本已删除'); showDeleteApp.value = false; await routerPush('/release/apps'); }
}

onMounted(load);
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false"><div class="app-hero"><div class="app-icon"><img v-if="app?.iconUrl" :src="app.iconUrl" :alt="app.appName" /><template v-else>{{ app?.appName?.slice(0, 1) }}</template></div><div><p>ANDROID APPLICATION</p><h2>{{ app?.appName || '加载中' }}</h2><code>{{ app?.packageName }}</code></div><div class="hero-actions"><NTag :type="app?.status === 'ENABLED' ? 'success' : 'default'" round>{{ app?.status === 'ENABLED' ? '运行中' : '已停用' }}</NTag><NButton v-if="canDelete" ghost type="error" @click="showDeleteApp = true">删除应用</NButton><NButton ghost type="primary" tag="a" :disabled="!app?.latestReleaseId" :href="`${serviceBaseUrl}/download/apps/${app?.packageName}/latest`">下载最新版</NButton></div></div></NCard>
    <NCard title="版本档案" :bordered="false"><NDataTable :columns="columns" :data="releases" :loading="loading" :row-key="r => r.id" /></NCard>
  </NSpace>
  <NModal v-model:show="showDeleteApp" preset="card" title="删除应用" :style="{ width: '480px' }">
    <NSpace vertical :size="16"><NAlert type="error" title="此操作无法恢复">应用下的全部版本、APK 文件和应用记录都会被永久删除。</NAlert><div><p class="confirm-tip">请输入应用名称 <b>{{ app?.appName }}</b> 以确认删除：</p><NInput v-model:value="deleteAppName" :placeholder="app?.appName" @keyup.enter="handleDeleteApp" /></div><NSpace justify="end"><NButton @click="showDeleteApp = false">取消</NButton><NButton type="error" :loading="deletingApp" :disabled="deleteAppName.trim() !== app?.appName" @click="handleDeleteApp">永久删除</NButton></NSpace></NSpace>
  </NModal>
</template>

<style scoped>.app-hero{display:grid;grid-template-columns:72px 1fr auto;align-items:center;gap:18px}.app-icon{display:grid;width:68px;height:68px;overflow:hidden;place-items:center;border-radius:18px;background:#17211b;color:#b8f34a;font-size:28px;font-weight:800}.app-icon img{width:100%;height:100%;object-fit:cover}.app-hero p{margin:0;color:#6f8376;font:700 10px ui-monospace,monospace;letter-spacing:.16em}.app-hero h2{margin:5px 0;font-size:26px}.app-hero code{color:#708077}.hero-actions{display:flex;align-items:center;gap:12px}.confirm-tip{margin:0 0 8px;color:#59665e}:deep(.version-cell){display:flex;flex-direction:column;gap:4px}:deep(.version-cell code){color:#859188;font-size:11px}@media(max-width:650px){.app-hero{grid-template-columns:60px 1fr}.hero-actions{grid-column:1/-1;flex-wrap:wrap}}</style>
