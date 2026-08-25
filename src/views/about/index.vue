<script setup lang="ts">
/** 芽分发项目说明页：展示真实能力、线上架构和代码仓库。 */
const services = [
  { no: '01', name: '管理后台', value: 'Cloudflare Pages', note: 'Vue 3 · SoybeanAdmin' },
  { no: '02', name: '业务接口', value: 'Cloudflare Worker', note: 'Hono · WebCrypto' },
  { no: '03', name: '业务数据', value: 'Cloudflare D1', note: '应用 · 版本 · 权限' },
  { no: '04', name: '安装包', value: 'GitHub Releases', note: '公开下载 · 免费托管' }
];

const repositories = [
  { label: '前端', href: 'https://github.com/Xxcool/app-harbor-web', name: 'app-harbor-web' },
  { label: '线上 API', href: 'https://github.com/Xxcool/app-harbor-api', name: 'app-harbor-api' },
  { label: 'Java 后端', href: 'https://github.com/Xxcool/app-harbor-server-java', name: 'app-harbor-server-java' }
];
</script>

<template>
  <div class="about-page">
    <section class="masthead">
      <div class="brand-mark">芽</div>
      <div class="mast-copy">
        <p>ABOUT SPROUT RELEASE</p>
        <h1>芽分发</h1>
        <h2>让每个测试版本萌芽，<br />让每次内部交付清晰抵达。</h2>
      </div>
      <div class="version"><span>当前版本</span><strong>1.0.0</strong><i>FREE EDITION</i></div>
    </section>

    <section class="story-grid">
      <article class="mission">
        <p class="section-label">WHAT IT DOES</p>
        <h3>一个 APK，自动找到它所属的应用。</h3>
        <p>上传后自动读取应用名称、图标、安卓包名和版本号。同一包名持续追加版本，新包名自动建立应用档案，并保留文件摘要、版本历史和下载入口。</p>
        <div class="capabilities">
          <span>包名自动归档</span><span>名称图标解析</span><span>版本历史</span><span>公开下载</span><span>角色权限</span><span>操作日志</span>
        </div>
      </article>
      <aside class="limit-card">
        <p class="section-label">FREE BY DESIGN</p>
        <strong>¥ 0</strong>
        <h4>以免费服务组成的发布链路</h4>
        <p>当前线上方案不启用需要计费订阅的 R2。受 Cloudflare 免费版请求大小限制，单个 APK 最大 95 MB。</p>
      </aside>
    </section>

    <section class="architecture">
      <header><p class="section-label">LIVE ARCHITECTURE</p><h3>当前线上架构</h3></header>
      <div class="service-list">
        <article v-for="item in services" :key="item.no"><b>{{ item.no }}</b><span>{{ item.name }}</span><strong>{{ item.value }}</strong><i>{{ item.note }}</i></article>
      </div>
    </section>

    <section class="repositories">
      <div><p class="section-label">SOURCE CODE</p><h3>项目仓库</h3><p>前端、Cloudflare 线上后端和 Java 自建服务器版本分别维护，避免部署方案互相混淆。</p></div>
      <div class="repo-list"><a v-for="repo in repositories" :key="repo.name" :href="repo.href" target="_blank" rel="noreferrer"><span>{{ repo.label }}</span><strong>{{ repo.name }}</strong><b>↗</b></a></div>
    </section>

    <footer>Built on SoybeanAdmin · Vue 3 · Hono · Cloudflare · GitHub</footer>
  </div>
</template>

<style scoped>
.about-page{--ink:#17211b;--acid:#b8f34a;display:grid;gap:18px;color:var(--ink)}.masthead{position:relative;overflow:hidden;display:grid;grid-template-columns:140px 1fr auto;gap:36px;align-items:end;min-height:310px;padding:42px;border-radius:22px;background:var(--ink);color:#f3f6ef}.masthead:after{content:'';position:absolute;right:18%;top:-210px;width:430px;height:430px;border:1px solid #ffffff18;border-radius:50%;box-shadow:0 0 0 55px #ffffff08,0 0 0 110px #ffffff04}.brand-mark{display:grid;width:124px;height:124px;place-items:center;border-radius:30px 30px 30px 8px;background:var(--acid);color:var(--ink);font-size:66px;font-weight:900;transform:rotate(-3deg)}.mast-copy{z-index:1}.mast-copy p,.section-label{margin:0 0 12px;color:#789084;font:700 10px ui-monospace,monospace;letter-spacing:.18em}.mast-copy p{color:var(--acid)}.mast-copy h1{margin:0;font-size:clamp(48px,7vw,82px);line-height:.95;letter-spacing:-.07em}.mast-copy h2{margin:20px 0 0;color:#b7c1ba;font-size:17px;font-weight:400;line-height:1.6}.version{z-index:1;display:flex;flex-direction:column;align-items:flex-end}.version span{color:#8e9b92;font-size:12px}.version strong{font:700 34px ui-monospace,monospace}.version i{color:var(--acid);font:700 9px ui-monospace,monospace;letter-spacing:.15em}.story-grid{display:grid;grid-template-columns:1.4fr .6fr;gap:18px}.mission,.limit-card,.architecture,.repositories{border:1px solid #dfe5dd;border-radius:18px;background:#fff}.mission{padding:34px}.mission h3,.architecture h3,.repositories h3{margin:0;font-size:26px;letter-spacing:-.035em}.mission>p:not(.section-label){max-width:760px;color:#647169;line-height:1.8}.capabilities{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}.capabilities span{padding:8px 12px;border-radius:999px;background:#eef4e9;color:#405247;font-size:12px}.limit-card{padding:30px;background:#eaf6d0}.limit-card>strong{display:block;margin:18px 0 0;font-size:68px;line-height:1}.limit-card h4{margin:10px 0;font-size:17px}.limit-card>p:last-child{color:#56644d;line-height:1.7}.architecture{padding:30px}.architecture header{margin-bottom:20px}.service-list{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #dfe5dd;border-left:1px solid #dfe5dd}.service-list article{display:flex;min-height:150px;flex-direction:column;padding:18px;border-right:1px solid #dfe5dd;border-bottom:1px solid #dfe5dd}.service-list b{color:#8c9a90;font:600 10px ui-monospace,monospace}.service-list span{margin-top:24px;color:#718078;font-size:12px}.service-list strong{margin-top:5px;font-size:17px}.service-list i{margin-top:auto;color:#9aa59d;font:500 10px ui-monospace,monospace}.repositories{display:grid;grid-template-columns:.8fr 1.2fr;gap:40px;padding:30px}.repositories>div>p:last-child{color:#718078;line-height:1.7}.repo-list{display:grid}.repo-list a{display:grid;grid-template-columns:80px 1fr auto;align-items:center;padding:16px 4px;border-bottom:1px solid #e4e9e2;color:inherit}.repo-list span{color:#7b887f;font-size:12px}.repo-list b{color:#52655a}footer{text-align:center;color:#8d9991;font:600 10px ui-monospace,monospace;letter-spacing:.12em}@media(max-width:900px){.masthead{grid-template-columns:100px 1fr}.brand-mark{width:90px;height:90px;font-size:48px}.version{display:none}.story-grid,.repositories{grid-template-columns:1fr}.service-list{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.masthead{grid-template-columns:1fr;padding:28px}.brand-mark{width:72px;height:72px;font-size:38px}.service-list{grid-template-columns:1fr}.mission,.limit-card,.architecture,.repositories{padding:22px}}
</style>
