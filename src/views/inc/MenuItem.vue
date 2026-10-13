<template>
  <el-sub-menu v-if="menu.children?.length" :index="menu.name">
    <template #title>{{ menu.title }}</template>
    <el-menu-item v-if="menu.component" :index="menu.path">{{ menu.title }}</el-menu-item>
    <MenuItem v-for="child in menu.children" :key="child.name" :menu="child" />
  </el-sub-menu>
  <el-menu-item v-else-if="menu.component" :index="menu.path">{{ menu.title }}</el-menu-item>
</template>
<script setup lang="ts">
import type { Menu } from '@/store/modules/menus'
defineProps<{ menu: Menu }>()
</script>
