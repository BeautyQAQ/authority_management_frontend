<template>
  <main id="main-content" class="login-page" tabindex="-1">
    <section class="login-panel">
      <p class="eyebrow">流沙社区</p>
      <h1>登录管理后台</h1>
      <p class="hint">使用管理员分配的账号登录。</p>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="login">
        <el-form-item label="用户名" prop="username"><el-input v-model="form.username" autocomplete="username" maxlength="64" /></el-form-item>
        <el-form-item label="密码" prop="password"><el-input v-model="form.password" type="password" show-password autocomplete="current-password" /></el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="captcha-row">
            <el-input v-model="form.code" autocomplete="off" maxlength="5" />
            <button type="button" class="captcha" aria-label="刷新验证码" :disabled="captchaBusy || busy" :aria-busy="captchaBusy" @click="getCaptcha">
              <img v-if="captchaImg" :src="captchaImg" alt="登录验证码，点击刷新" width="120" height="40" /><span v-else>{{ captchaBusy ? '加载中…' : '刷新验证码' }}</span>
            </button>
          </div>
          <p v-if="captchaError" class="captcha-error" role="alert">{{ captchaError }}</p>
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="busy" :disabled="captchaBusy || !form.token" class="submit">登录</el-button>
      </el-form>
    </section>
  </main>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { type FormInstance, type FormRules } from 'element-plus'
import request from '@/axios'
import store from '@/store'
import router, { resetRoutes } from '@/router'
import type { ApiResult } from '@/types'
const formRef = ref<FormInstance>(), busy = ref(false), captchaImg = ref('')
const captchaBusy = ref(false), captchaError = ref('')
const form = reactive({ username: 'admin', password: '', code: '', token: '' })
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, len: 5, message: '请输入 5 位验证码', trigger: 'blur' }]
}
async function getCaptcha() {
  if (captchaBusy.value) return
  captchaBusy.value = true; captchaError.value = ''
  form.code = ''; form.token = ''; captchaImg.value = ''
  try {
    const { data } = await request.get<ApiResult<{ token: string; captchaImg: string }>>('/captcha')
    form.token = data.data.token; captchaImg.value = data.data.captchaImg
  } catch { captchaError.value = '验证码加载失败，请点击右侧按钮重试。' }
  finally { captchaBusy.value = false }
}
async function login() {
  if (busy.value || captchaBusy.value || !form.token || !await formRef.value?.validate().catch(() => false)) return
  busy.value = true
  try {
    const { data } = await request.post<ApiResult<{ token: string }>>('/login', new URLSearchParams(form))
    store.commit('resetState'); resetRoutes(); store.commit('SET_TOKEN', data.data.token)
    await router.replace('/index')
  } catch { await getCaptcha() }
  finally { busy.value = false }
}
onMounted(getCaptcha)
</script>
<style scoped>
.login-page { min-height: 100vh; display: grid; place-items: center; background: #f1f5f8; padding: 24px; box-sizing: border-box; }
.login-panel { width: 100%; max-width: 380px; padding: 36px; background: white; border-radius: 16px; box-shadow: 0 12px 40px #20364c12; }
h1 { font-size: 26px; margin: 8px 0; color: #243449; }
.eyebrow { color: #11897c; font-weight: 600; margin: 0; }
.hint { color: #68798b; margin-bottom: 28px; }
.captcha-row { display: flex; gap: 12px; width: 100%; }
.captcha-row :deep(.el-input) { min-width: 0; }
.captcha-error { color: #b42318; line-height: 1.5; margin-top: 8px; }
.captcha:disabled { cursor: wait; opacity: .7; }
.captcha { padding: 0; background: #f6f7f8; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; min-width: 120px; min-height: 42px; }
.captcha img { display: block; width: 120px; height: 40px; }
.submit { width: 100%; margin-top: 8px; }
@media (max-width: 480px) { .login-page { padding: 16px; }.login-panel { padding: 24px 20px; } }
</style>
