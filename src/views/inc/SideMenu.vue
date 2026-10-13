<template>
  <el-menu router :default-active="$route.path" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
    <el-menu-item index="/index">首页</el-menu-item>
    <MenuItem v-for="menu in menus" :key="menu.name" :menu="menu" />
  </el-menu>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import MenuItem from './MenuItem.vue'
import store from '@/store'
const menus = computed(() => store.state.menus.menuList)
</script>
<style scoped>.el-menu { min-height: 100%; }</style>
