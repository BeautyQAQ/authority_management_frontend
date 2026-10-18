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

## 容器交付

```bash
docker build -t liushao/admin-web:local .
docker run --rm --name admin-web --network liushao \
  -p 127.0.0.1:5174:8080 \
  -e API_UPSTREAM=http://admin-api:8081 \
  liushao/admin-web:local
```

独立运行示例要求已创建 `liushao` Docker 网络，且管理后端以 `admin-api` 网络别名加入该网络。完整四服务及 MySQL/Redis 的启动方式见工作区根目录部署说明。

镜像使用 Node.js 22 执行 `npm ci --include=dev` 和严格类型检查构建，运行阶段使用非 root 的 `nginxinc/nginx-unprivileged:stable-alpine`，监听 `8080`。构建上下文排除本地 `.env*`、`.npmrc`、依赖和已有产物；镜像固定浏览器 API 地址为同源 `/api`，关闭 Mock。Vite 环境变量会写入前端产物，请勿用它们存储密钥。

`API_UPSTREAM` 是容器启动时的后端地址，默认 `http://admin-api:8081`，填写协议、主机及端口，不带路径或结尾 `/`。Nginx 将 `/api/captcha` 转成后端 `/captcha`，保留查询参数、请求方法、请求体和认证头。此变量改变后需要重建容器，无需重新构建镜像。

Nginx 使用 Docker 自定义网络的 DNS `127.0.0.11`，解析缓存有效期为 10 秒；后端重建换 IP 后，无需重启前端即可在缓存过期后的请求中重新解析。后端启动和旧地址缓存期间 API 可能暂时返回 502。配置通过 `rewrite ... break` 剥离 `/api/`，再使用不含 URI 的变量 `proxy_pass` 转发，从而保留改写后的路径和原查询参数，语义见 [Nginx proxy_pass 文档](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)；缓存配置见 [resolver 文档](https://nginx.org/en/docs/http/ngx_http_core_module.html#resolver)。该 DNS 地址适用于此容器方案，迁移到其他运行环境时需按实际 DNS 修改。

`GET /healthz` 返回 `200 ok`，用于镜像健康检查，仅表示静态服务可用；后端有独立健康检查。Nginx 支持 history 页面刷新，入口 HTML 每次重新验证缓存，带哈希的 `/assets/` 文件缓存一年；缺失的 `/assets/` 资源返回 404，API 错误保持原状态码。

入口会覆盖客户端提供的转发头，后端依据真实连接来源执行限流。`X-Forwarded-Host` 保留请求 Host，`X-Forwarded-Port` 从 Host 中提取对外端口（兼容 `[::1]:端口`；当前 HTTP 入口不带端口时为 80），避免容器端口和对外端口不一致导致同源请求被拒绝；客户端伪造的转发端口会被覆盖。若外层增加 TLS 反向代理，需要按实际可信代理地址配置 Nginx 的真实 IP、协议与对外端口处理，不能直接信任任意来源的 `X-Forwarded-*`。线上 HTTPS、备份和数据库迁移要求见根目录部署说明。

`.github/workflows/ci.yml` 在 push、pull request 或手动触发时安装锁定依赖、执行严格类型检查及生产构建，再构建容器镜像。CI 不需要业务密钥，不推送镜像，也不部署。

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

## 社区运营

登录后台后，「社区运营」提供社区账号、帖子审核、评论管理、公告、提示语、推广链接、标签及运营审计页面。菜单来自后端权限，操作按钮按 `community:*` 权限禁用；列表包含分页、搜索、空态和错误提示，详情中的社区内容按纯文本显示，避免执行投稿中的 HTML。

「系统管理」维护后台登录账号和角色；「社区账号」管理社区注册用户，两者互不复用。账号禁用/恢复、帖子审核与删除、评论隐藏/恢复与删除需要填写原因。帖子审核同时设置发布状态、置顶及精华；删除帖子或评论会清理关联内容，提交前有明确确认。标签仍被帖子使用时禁止删除。

浏览器只请求当前后台 `/api/community/**`。社区内部地址和连接密钥由管理后端配置，前端不持有密钥。运营审计显示执行操作的后台用户名；记录只能读取。

手机宽度下通过页首按钮打开抽屉导航，表格可在内容区横向滚动，分页按可用宽度换行。

## 前端加载与体验

Element Plus 的模板组件与 `v-loading` 通过 `unplugin-vue-components` 按需引入，消息/确认框等命令式 API 的样式由 `unplugin-element-plus` 补齐。中文语言配置统一放在根 `ElConfigProvider`。管理布局延迟加载，登录页不加载后台导航、表格和运营页面。

`src/components.d.ts` 是构建插件生成的组件类型声明，需要随代码保留，保证干净检出后首次 `npm run build` 也进行完整模板类型检查。表格列通过 `@vue-generic` 关联业务行类型。

页面提供跳到主要内容的键盘入口、可见焦点和手机弹窗宽度限制；验证码支持加载/失败提示、重试与防重复请求。性能对比、测量条件和浏览器验收范围见工作区根目录 `FRONTEND_PERFORMANCE.md`。
