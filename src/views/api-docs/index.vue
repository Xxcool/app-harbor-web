<!-- 芽分发 API 文档入口：在系统布局内嵌 Worker 提供的 Swagger UI。 -->
<script setup lang="ts">
const serviceBaseUrl = import.meta.env.VITE_SERVICE_BASE_URL;
const swaggerUrl = `${serviceBaseUrl}/swagger`;
const openApiUrl = `${serviceBaseUrl}/openapi.json`;
</script>

<template>
  <div class="docs-page">
    <header class="docs-head">
      <div>
        <p>DEVELOPER CONTRACT</p>
        <h2>API 文档</h2>
        <span>基于当前线上 Worker 自动提供的 OpenAPI 3.0 接口契约。</span>
      </div>
      <NSpace>
        <NButton ghost tag="a" :href="openApiUrl" target="_blank">OpenAPI JSON</NButton>
        <NButton ghost type="primary" tag="a" :href="swaggerUrl" target="_blank">新窗口打开</NButton>
      </NSpace>
    </header>
    <NAlert type="info" :bordered="false">
      在线调试受保护接口时，请先登录获取 token，再点击文档中的 Authorize 填入 Bearer Token。
    </NAlert>
    <div class="swagger-shell">
      <iframe title="芽分发 Swagger API 文档" :src="swaggerUrl" allow="clipboard-write" />
    </div>
  </div>
</template>

<style scoped>
.docs-page{display:grid;gap:14px;min-height:calc(100vh - 120px)}.docs-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:24px 28px;border:1px solid #dfe5dd;border-radius:18px;background:#fff}.docs-head p{margin:0 0 7px;color:#6f8376;font:700 10px ui-monospace,monospace;letter-spacing:.18em}.docs-head h2{margin:0 0 7px;color:#17211b;font-size:28px;letter-spacing:-.035em}.docs-head span{color:#708077}.swagger-shell{min-height:720px;overflow:hidden;border:1px solid #dfe5dd;border-radius:18px;background:#f4f7f2;box-shadow:0 16px 40px #17211b0d}.swagger-shell iframe{display:block;width:100%;height:calc(100vh - 270px);min-height:720px;border:0}@media(max-width:700px){.docs-head{align-items:flex-start;flex-direction:column;padding:20px}.swagger-shell iframe{height:760px}}
</style>

