<template>
  <el-menu router :default-active="$route.path" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
    <el-menu-item index="/index">首页</el-menu-item>
    <el-sub-menu v-for="menu in menus" :key="menu.name" :index="menu.name">
      <template #title>{{ menu.title }}</template>
      <el-menu-item v-for="child in menu.children?.filter(item => item.component)" :key="child.name" :index="child.path">{{ child.title }}</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import store from '@/store'
const menus = computed(() => store.state.menus.menuList)
</script>
<style scoped>.el-menu { min-height: 100%; }</style>
