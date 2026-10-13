<template>
  <section class="welcome">
    <h1>流沙社区管理后台</h1>
    <p>从下方入口或左侧菜单开始管理。</p>
    <div class="shortcuts">
      <router-link v-for="entry in entries" :key="entry.path" :to="entry.path" class="shortcut">
        <strong>{{ entry.title }}</strong><span>{{ entry.description }}</span>
      </router-link>
      <router-link to="/userCenter" class="shortcut"><strong>个人中心</strong><span>修改当前账号密码</span></router-link>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { hasAuth } from '@/globalFun'
const entries = computed(() => [
  { path: '/sys/users', title: '用户管理', description: '维护账号、分配角色与重置密码', permission: 'sys:user:list' },
  { path: '/sys/roles', title: '角色管理', description: '维护角色与菜单访问权限', permission: 'sys:role:list' },
  { path: '/sys/menus', title: '菜单管理', description: '查看菜单结构与权限定义', permission: 'sys:menu:list' }
].filter(entry => hasAuth(entry.permission)))
</script>
<style scoped>
.welcome { padding: 24px 8px; color: #243449; }
h1 { font-size: 26px; }.welcome p { color: #68798b; }
.shortcuts { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 28px; }
.shortcut { padding: 24px; border: 1px solid #e3e8ee; border-radius: 12px; text-decoration: none; color: inherit; display: grid; gap: 12px; }
.shortcut:hover { border-color: #17b3a3; background: #f6fbfa; }.shortcut span { color: #68798b; font-size: 14px; }
</style>
