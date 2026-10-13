# 流沙社区管理前端

Vue 3.5.43 + TypeScript（strict）+ Vite 8 + Vue Router 4 + Vuex 4 + Element Plus。


## 开发

使用 Node.js 22.12+（已验证 22.23.1）。

```bash
npm ci --include=dev
cp .env.example .env.local
npm run dev
```

默认访问 http://localhost:5174 。开发服务器将 `/api` 转发到 `.env.local` 的 `VITE_API_PROXY_TARGET`。

```bash
npm run typecheck
npm run build
npm run preview
```

`build` 包含类型检查。发布 `dist/` 时需要在反向代理中配置 `/api` 到后端；Vite 的开发代理不会进入生产包。管理站使用 history 路由，服务器需回退到 index.html。

## 演示模式

默认 `VITE_ENABLE_MOCK=false`，对接真实后端。开发时可以在 `.env.local` 设置 `VITE_ENABLE_MOCK=true` 后重启，使用 admin、任意非空密码和五位验证码进入演示。

Mock 只在开发构建中加载，数据不持久化。现有后端还缺少业务登录和 `/sys/menu/nav`、用户/角色/菜单 CRUD 实现；真实登录闭环属于第二阶段，不能把 Mock 成功当作后端可用。

完整迁移范围、验收记录和后续计划见工作区根目录 `MODERNIZATION.md`。
