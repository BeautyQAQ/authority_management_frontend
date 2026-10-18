<template>
  <el-config-provider :locale="zhCn">
    <a class="skip-link" href="#main-content" @click.prevent="focusContent">跳到主要内容</a>
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
function focusContent() { document.getElementById('main-content')?.focus({ preventScroll: true }) }
watch(() => route.fullPath, async () => { await nextTick(); focusContent() })
</script>

<style>
	html, body, #app {
		font-family: 'Helvetica Neue', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'Microsoft Yahei', sans-serif;
		height: 100%;
		padding: 0;
		margin: 0;
		font-size: 15px;
	}
  *, *::before, *::after { box-sizing: border-box; }
  :focus-visible { outline: 2px solid #087f75; outline-offset: 3px; }
  .skip-link { position: fixed; z-index: 3000; top: 8px; left: 12px; padding: 10px 16px; background: white; color: #087f75; border: 2px solid #087f75; transform: translateY(-160%); }
  .skip-link:focus { transform: translateY(0); }
  @media (max-width: 760px) {
    .el-dialog { --el-dialog-width: calc(100vw - 32px); max-width: calc(100vw - 32px); }
    .el-message-box { max-width: calc(100vw - 32px); }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
</style>
