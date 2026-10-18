<template>
  <section class="operations">
    <h2>社区账号</h2>
    <p class="description">这里管理社区注册用户。后台登录账号和角色请在「系统管理」中维护。</p>
    <el-form inline @submit.prevent="search">
      <el-form-item><el-input v-model="query" placeholder="社区用户名、昵称或邮箱" maxlength="100" clearable @keyup.enter="search" /></el-form-item>
      <el-form-item><el-button :loading="loading" @click="search">搜索</el-button></el-form-item>
      <el-form-item><el-button :disabled="loading" @click="load">刷新</el-button></el-form-item>
    </el-form>
    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
    <el-table v-loading="loading" :data="rows" border empty-text="暂无符合条件的社区账号">
      <!-- @vue-generic {CommunityUser} -->
      <el-table-column prop="id" label="社区 ID" width="95" />
      <!-- @vue-generic {CommunityUser} -->
      <el-table-column prop="username" label="社区用户名" min-width="140" />
      <!-- @vue-generic {CommunityUser} -->
      <el-table-column prop="alias" label="昵称" min-width="120" />
      <!-- @vue-generic {CommunityUser} -->
      <el-table-column prop="email" label="邮箱" min-width="190" />
      <!-- @vue-generic {CommunityUser} -->
      <el-table-column label="账号状态" width="100"><template #default="{ row }"><el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '正常' : '已禁用' }}</el-tag></template></el-table-column>
      <!-- @vue-generic {CommunityUser} -->
      <el-table-column label="注册时间" min-width="175"><template #default="{ row }">{{ formatTime(row.createTime) }}</template></el-table-column>
      <!-- @vue-generic {CommunityUser} -->
      <el-table-column label="操作" width="180" fixed="right"><template #default="{ row }">
        <el-button link type="primary" @click="showDetail(row.id)">详情</el-button>
        <el-button link :type="row.status ? 'danger' : 'success'" :disabled="saving || !hasAuth('community:user:status')" @click="openStatus(row)">{{ row.status ? '禁用' : '恢复' }}</el-button>
      </template></el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageNo" v-model:page-size="size" :page-sizes="[10,20,50]" :total="total" layout="total, sizes, prev, pager, next" @current-change="load" @size-change="search" />
    <el-dialog v-model="detailVisible" title="社区账号详情" width="min(680px,94vw)">
      <div v-loading="detailLoading"><el-alert v-if="detailError" :title="detailError" type="error" :closable="false" />
        <el-descriptions v-if="detail" :column="1" border>
          <el-descriptions-item label="社区 ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="社区用户名">{{ detail.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ detail.alias }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detail.email }}</el-descriptions-item>
          <el-descriptions-item label="简介"><span class="text-content">{{ detail.bio || '—' }}</span></el-descriptions-item>
          <el-descriptions-item label="账号状态">{{ detail.status ? '正常' : '已禁用' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatTime(detail.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
    <el-dialog v-model="statusVisible" :title="selected?.status ? '禁用社区账号' : '恢复社区账号'" width="min(560px,94vw)" :close-on-click-modal="!saving" :close-on-press-escape="!saving" :show-close="!saving">
      <p>社区账号：<strong>{{ selected?.username }}</strong>。保存后该账号的现有登录会失效。</p>
      <el-form ref="form" :model="statusForm" label-position="top">
        <el-form-item label="操作原因" prop="reason" :rules="[{ required: true, whitespace: true, message: '请填写操作原因', trigger: 'blur' }]">
          <el-input v-model="statusForm.reason" type="textarea" :rows="3" maxlength="255" show-word-limit />
        </el-form-item>
      </el-form>
      <el-alert v-if="saveError" :title="saveError" type="error" :closable="false" />
      <template #footer><el-button :disabled="saving" @click="statusVisible=false">取消</el-button><el-button :type="selected?.status ? 'danger' : 'primary'" :loading="saving" @click="saveStatus">确认{{ selected?.status ? '禁用' : '恢复' }}</el-button></template>
    </el-dialog>
  </section>
</template>
<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import request from '@/axios'
import { hasAuth } from '@/globalFun'
import type { ApiResult } from '@/types'
import { type CommunityUser, formatTime } from '@/community/types'
import { useCommunityList, messageOf } from '@/community/useCommunityList'
const { rows,total,pageNo,size,query,loading,error,load,search } = useCommunityList<CommunityUser>('users')
const detailVisible=ref(false), detailLoading=ref(false), detailError=ref(''), detail=ref<CommunityUser>()
const statusVisible=ref(false), selected=ref<CommunityUser>(), saving=ref(false), saveError=ref(''), form=ref<FormInstance>()
const statusForm=reactive({ reason:'' })
async function showDetail(id:number) {
  detail.value=undefined; detailError.value=''; detailVisible.value=true; detailLoading.value=true
  try { detail.value=(await request.get<ApiResult<CommunityUser>>(`/community/users/${id}`)).data.data }
  catch(e){ detailError.value=messageOf(e) } finally { detailLoading.value=false }
}
async function openStatus(user:CommunityUser) {
  selected.value=user; statusForm.reason=''; saveError.value=''; statusVisible.value=true
  await nextTick(); form.value?.clearValidate()
}
async function saveStatus() {
  if(saving.value || !selected.value || !await form.value?.validate().catch(()=>false)) return
  saving.value=true; saveError.value=''
  try { await request.put(`/community/users/${selected.value.id}/status`, { status:!selected.value.status, reason:statusForm.reason.trim() }); statusVisible.value=false; ElMessage.success('社区账号状态已更新'); await load() }
  catch(e){saveError.value=messageOf(e)} finally {saving.value=false}
}
</script>
<style scoped>.description{color:#606266}.el-pagination{margin-top:20px;justify-content:flex-end}.text-content{white-space:pre-wrap;overflow-wrap:anywhere}.el-alert{margin-bottom:16px}</style>
