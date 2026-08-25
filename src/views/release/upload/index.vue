<script setup lang="ts">
/** APK 发布页：在浏览器本地解析清单和摘要，再将原始文件流上传到 Worker。 */
import { computed, ref } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { uploadApk } from '@/service/api';

interface ParsedApk {
  package: string;
  versionCode: number | string;
  versionName: string;
  usesSdk?: { minSdkVersion?: string | number; targetSdkVersion?: string | number };
  application?: { label?: string };
}

declare global {
  interface Window {
    AppInfoParser: new (file: File) => { parse: () => Promise<ParsedApk> };
  }
}

const maxBytes = 95 * 1024 * 1024;
const { routerPush } = useRouterPush(false);
const file = ref<File>();
const parsed = ref<ParsedApk>();
const notes = ref('');
const mode = ref('NORMAL');
const progress = ref(0);
const parsing = ref(false);
const uploading = ref(false);
const fileSize = computed(() => (file.value ? `${(file.value.size / 1024 / 1024).toFixed(1)} MB` : ''));

async function select(options: { file: { file: File | null } }) {
  file.value = options.file.file || undefined;
  parsed.value = undefined;
  progress.value = 0;
  if (!file.value) return;
  if (!file.value.name.toLowerCase().endsWith('.apk')) {
    file.value = undefined;
    window.$message?.error('请选择 .apk 文件');
    return;
  }
  if (file.value.size > maxBytes) {
    file.value = undefined;
    window.$message?.error('Cloudflare 免费版单次请求限制为 100 MB，请选择不超过 95 MB 的 APK');
    return;
  }
  parsing.value = true;
  try {
    parsed.value = await new window.AppInfoParser(file.value).parse();
  } catch {
    file.value = undefined;
    window.$message?.error('APK 清单解析失败，请确认文件完整且未损坏');
  } finally {
    parsing.value = false;
  }
}

async function submit() {
  if (!file.value || !parsed.value) return window.$message?.warning('请先选择 APK 文件');
  uploading.value = true;
  try {
    const digest = await crypto.subtle.digest('SHA-256', await file.value.arrayBuffer());
    const sha256 = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    const result = await uploadApk(
      file.value,
      {
        packageName: parsed.value.package,
        appName: parsed.value.application?.label || parsed.value.package,
        versionCode: Number(parsed.value.versionCode),
        versionName: parsed.value.versionName,
        filename: file.value.name,
        fileSize: file.value.size,
        sha256,
        minSdk: String(parsed.value.usesSdk?.minSdkVersion || ''),
        targetSdk: String(parsed.value.usesSdk?.targetSdkVersion || ''),
        releaseNotes: notes.value,
        updateMode: mode.value
      },
      event => {
        progress.value = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
      }
    );
    if (!result.error) {
      window.$notification?.success({ title: '上传成功', content: `${parsed.value.application?.label || parsed.value.package} ${result.data.versionName} 已按包名自动归档` });
      routerPush(`/release/apps-detail/${result.data.appId}`);
    }
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <div class="upload-page">
    <section class="upload-intro">
      <p>APK INTAKE</p>
      <h1>上传一次<br />自动归档。</h1>
      <ol>
        <li><b>01</b>自动读取应用名称与包名</li>
        <li><b>02</b>同包名追加到已有应用</li>
        <li><b>03</b>新包名自动创建应用并开放下载</li>
      </ol>
    </section>
    <NCard :bordered="false" class="upload-card">
      <NUpload :default-upload="false" accept=".apk,application/vnd.android.package-archive" :max="1" directory-dnd @change="select">
        <NUploadDragger>
          <div class="drop-icon"><SvgIcon icon="ph:android-logo-bold" /></div>
          <h3>拖入 uni-app 生成的 APK</h3>
          <p>或点击选择文件，Cloudflare 免费版最大 95 MB</p>
        </NUploadDragger>
      </NUpload>
      <div v-if="file" class="file-summary">
        <div><strong>{{ file.name }}</strong><span>{{ fileSize }}</span></div>
        <div v-if="parsed" class="manifest"><code>{{ parsed.package }}</code><span>v{{ parsed.versionName }} ({{ parsed.versionCode }})</span></div>
        <NProgress v-if="uploading" type="line" :percentage="progress" />
      </div>
      <NForm label-placement="top">
        <NFormItem label="更新方式">
          <NRadioGroup v-model:value="mode">
            <NRadioButton value="NORMAL">普通更新</NRadioButton>
            <NRadioButton value="FORCE">强制更新</NRadioButton>
            <NRadioButton value="SILENT">静默更新</NRadioButton>
          </NRadioGroup>
        </NFormItem>
        <NFormItem label="更新说明"><NInput v-model:value="notes" type="textarea" :rows="5" placeholder="说明本次版本的改动、注意事项或测试范围" /></NFormItem>
      </NForm>
      <NButton block type="primary" size="large" :loading="parsing || uploading" :disabled="!file || !parsed" @click="submit">{{ parsing ? '正在读取应用信息' : uploading ? '正在上传并自动归档' : '上传 APK' }}</NButton>
    </NCard>
  </div>
</template>

<style scoped>
.upload-page{display:grid;grid-template-columns:minmax(280px,.75fr) minmax(420px,1.25fr);gap:18px;min-height:calc(100vh - 150px)}.upload-intro{padding:42px;border-radius:20px;background:#17211b;color:#f3f5f0}.upload-intro>p{color:#b8f34a;font:700 11px ui-monospace,monospace;letter-spacing:.18em}.upload-intro h1{margin:24px 0 60px;font-size:50px;line-height:1.02;letter-spacing:-.05em}.upload-intro ol{display:grid;gap:18px;padding:0;list-style:none;color:#b8c1bb}.upload-intro li{display:flex;gap:18px;border-top:1px solid #ffffff1f;padding-top:14px}.upload-intro b{color:#b8f34a;font-family:ui-monospace,monospace}.upload-card{padding:18px}:deep(.n-upload-dragger){padding:50px 20px;border:1px dashed #9daf9f;border-radius:16px;background:#f6f8f4}.drop-icon{font-size:46px;color:#4d6b58}.file-summary{margin:18px 0;padding:14px;border-radius:12px;background:#f1f5ef}.file-summary>div{display:flex;justify-content:space-between;gap:16px;margin-bottom:8px}.file-summary span{color:#718078}.manifest{padding-top:8px;border-top:1px solid #dbe5d8}.manifest code{overflow:hidden;text-overflow:ellipsis;color:#365342}@media(max-width:850px){.upload-page{grid-template-columns:1fr}.upload-intro h1{margin-bottom:30px}}
</style>
