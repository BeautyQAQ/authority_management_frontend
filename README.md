# 流沙社区管理前端

Vue 3.5.43 + TypeScript（strict）+ Vite 8 + Vue Router 4 + Vuex 4 + Element Plus。

## 开发与构建

使用 Node.js 22.12+（已验证 22.23.1）：

```bash
npm ci --include=dev
cp .env.example .env.local
npm run dev
```

默认访问 http://localhost:5174 。开发服务器将 `/api` 转发到 `VITE_API_PROXY_TARGET`，默认后端 http://localhost:8081 。管理后端的数据库和初始管理员设置见其 README。

```bash
npm run typecheck
npm run build
npm run preview
```

`build` 包含严格类型检查。发布 `dist/` 时需配置 `/api` 反向代理及 history 路由回退到 index.html。

## 当前功能

- 真实验证码登录、退出与登录失效跳转；清理旧用户的菜单、标签和动态路由。
- 按后端权限加载导航，并控制用户/角色/菜单操作入口；后端独立执行授权检查。
- 用户分页搜索、新增、编辑、删除、角色分配及显式设置重置密码；不再使用固定初始密码。
- 角色分页搜索、维护与菜单权限分配；分配时后端自动补全父级权限。
- 菜单树维护、递归导航与父级选择；内置管理员和权限定义受保护。
- 个人改密成功后重新登录。错误提示来自统一请求层，提交失败保留表单。

管理端的账号独立于社区端。首次初始化后，用管理后端 `.env.local` 中的 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 登录，之后以实际修改的密码为准。

## 演示模式

默认 `VITE_ENABLE_MOCK=false`，使用真实后端。开发时可显式开启 Mock，使用 admin、任意非空密码和五位验证码预览旧演示数据。Mock 数据不持久化，不用于业务验收，生产包不加载 Mock。

2026-10-13 管理端已连接 NAS MySQL/Redis 完成真实接口联调。完整阶段记录见工作区根目录 `MODERNIZATION.md`。
