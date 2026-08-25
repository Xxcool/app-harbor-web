# 芽分发

基于 SoybeanAdmin 二次开发的安卓内部测试包分发平台。平台在浏览器中解析 APK 和 uni-app 清单，根据安卓包名自动归入对应应用，并记录应用名称、图标、版本、文件摘要和下载次数。

## 在线地址

- 管理后台：https://sprout-release.pages.dev
- Worker API：https://app-harbor-api.15623636530.workers.dev
- 公开 APK Releases：https://github.com/Xxcool/app-harbor-releases

默认管理员账号为 `admin`。生产使用后请及时修改默认密码。

## 功能

- 首页：应用数、版本数、下载量和存储量
- 应用管理：按包名自动建档、应用列表和版本历史
- APK 发布：本地解析应用名称、图标、包名、版本号、SDK 信息和 SHA-256
- 版本下载：通过公开 GitHub Releases 分发 APK
- 系统管理：用户、角色、菜单说明和操作日志
- 更新检查：为 uni-app 等客户端提供最新版本检查接口

## 免费部署架构

| 模块 | 服务 |
| --- | --- |
| 前端 | Cloudflare Pages，连接 GitHub `main` 自动构建 |
| API | Cloudflare Workers |
| 数据库 | Cloudflare D1 |
| APK 文件 | 公开 GitHub Releases |

Cloudflare 免费版单次请求上限为 100 MB，系统将单个 APK 限制为 95 MB。

## 本地开发

环境要求：Node.js ≥ 20.19、pnpm ≥ 10.5。

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm typecheck
pnpm build
```

生产环境 API 地址配置在 `.env.prod` 的 `VITE_SERVICE_BASE_URL`。

## API 返回结构

所有业务接口统一返回：

```json
{
  "code": "0000",
  "msg": "success",
  "data": {}
}
```

主要公共接口：

- `GET /api/public/check-update/:packageName/:versionCode`
- `GET /download/apps/:packageName/latest`
- `GET /download/releases/:releaseId`

## 技术栈与致谢

前端使用 Vue 3、Vite、TypeScript、Naive UI 和 SoybeanAdmin；后端使用 Hono、Cloudflare Workers 与 D1。感谢 [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin) 项目提供管理后台基础模板。
