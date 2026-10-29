<template>
  <section class="operations">
    <h2>帖子审核</h2>
    <p class="description">新帖及作者修改后的内容需要审核后公开。每次变更都会记录后台操作者及原因，并通知作者。</p>
    <el-form inline @submit.prevent="search">
      <el-form-item><el-input v-model="query" placeholder="标题或社区作者" maxlength="100" clearable @keyup.enter="search" /></el-form-item>
      <el-form-item><el-select v-model="status" clearable placeholder="全部状态" style="width:150px"><el-option v-for="(label,value) in postStatusLabel" :key="value" :label="label" :value="value" /></el-select></el-form-item>
      <el-form-item><el-button :loading="loading" @click="search">搜索</el-button><el-button :disabled="loading" @click="load">刷新</el-button></el-form-item>
    </el-form>
    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
    <el-table v-loading="loading" :data="rows" border empty-text="暂无符合条件的帖子">
      <!-- @vue-generic {CommunityPost} -->
      <el-table-column prop="id" label="ID" width="75" />
      <!-- @vue-generic {CommunityPost} -->
      <el-table-column prop="title" label="帖子标题" min-width="250" show-overflow-tooltip />
      <!-- @vue-generic {CommunityPost} -->
      <el-table-column prop="username" label="社区作者" min-width="125" />
      <!-- @vue-generic {CommunityPost} -->
      <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status==='PUBLISHED' ? 'success' : row.status==='PENDING' ? 'warning' : 'danger'">{{ postStatusLabel[row.status as PostStatus] }}</el-tag></template></el-table-column>
      <!-- @vue-generic {CommunityPost} -->
      <el-table-column label="推荐" width="130"><template #default="{ row }"><el-tag v-if="row.top">置顶</el-tag> <el-tag v-if="row.essence" type="warning">精华</el-tag><span v-if="!row.top && !row.essence">—</span></template></el-table-column>
      <!-- @vue-generic {CommunityPost} -->
      <el-table-column label="评论 / 点赞" width="115"><template #default="{ row }">{{ row.comments }} / {{ row.likes }}</template></el-table-column>
      <!-- @vue-generic {CommunityPost} -->
      <el-table-column label="发布时间" min-width="175"><template #default="{ row }">{{ formatTime(row.createTime) }}</template></el-table-column>
      <!-- @vue-generic {CommunityPost} -->
      <el-table-column label="操作" fixed="right" width="195"><template #default="{ row }">
        <el-button link type="primary" @click="open(row.id,false)">详情</el-button>
        <el-button link type="primary" :disabled="saving || !hasAuth('community:post:moderate')" @click="open(row.id,true)">审核</el-button>
        <el-button link type="danger" :disabled="saving || !hasAuth('community:post:delete')" @click="remove(row)">删除</el-button>
      </template></el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageNo" v-model:page-size="size" :page-sizes="[10,20,50]" :total="total" layout="total, sizes, prev, pager, next" @current-change="load" @size-change="search" />
    <el-dialog v-model="visible" :title="editing ? '审核帖子' : '帖子详情'" width="min(850px,95vw)" :close-on-click-modal="!saving" :close-on-press-escape="!saving" :show-close="!saving">
      <div v-loading="detailLoading">
        <el-alert v-if="detailError" :title="detailError" type="error" :closable="false" />
        <template v-if="detail">
          <h3>{{ detail.title }}</h3>
          <p class="description">社区作者 {{ detail.username }} · 帖子 #{{ detail.id }} · {{ formatTime(detail.createTime) }}</p>
          <p><el-tag v-for="tag in detail.tags" :key="typeof tag==='string' ? tag : tag.id">{{ typeof tag==='string' ? tag : tag.name }}</el-tag></p>
          <pre class="post-content">{{ detail.content }}</pre>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="当前状态">{{ postStatusLabel[detail.status] }}</el-descriptions-item>
            <el-descriptions-item label="版本">{{ detail.version }}</el-descriptions-item>
            <el-descriptions-item label="上次审核原因" :span="2">{{ detail.moderationReason || '—' }}</el-descriptions-item>
          </el-descriptions>
          <el-form v-if="editing" ref="form" :model="moderation" label-width="110px" class="moderation-form">
            <el-form-item label="审核结果" prop="status"><el-radio-group v-model="moderation.status"><el-radio v-for="(label,value) in postStatusLabel" :key="value" :value="value">{{ label }}</el-radio></el-radio-group></el-form-item>
            <el-form-item label="推荐设置"><el-checkbox v-model="moderation.top">置顶</el-checkbox><el-checkbox v-model="moderation.essence">精华</el-checkbox></el-form-item>
            <el-form-item label="操作原因" prop="reason" :rules="[{ required:true, whitespace:true, message:'请填写审核原因', trigger:'blur' }]"><el-input v-model="moderation.reason" type="textarea" :rows="3" maxlength="255" show-word-limit /></el-form-item>
          </el-form>
          <el-alert v-if="saveError" :title="saveError" type="error" :closable="false" />
          <el-button v-if="reviewConflict" @click="open(detail.id,true)">重新载入最新内容</el-button>
        </template>
      </div>
      <template #footer><el-button :disabled="saving" @click="visible=false">{{ editing ? '取消' : '关闭' }}</el-button><el-button v-if="editing" type="primary" :disabled="!detail || detailLoading || reviewConflict || !hasAuth('community:post:moderate')" :loading="saving" @click="save">确认审核</el-button></template>
    </el-dialog>
  </section>
</template>
<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import request from '@/axios'
import { hasAuth } from '@/globalFun'
import type { ApiResult } from '@/types'
import { type CommunityPost, type PostStatus, postStatusLabel, formatTime } from '@/community/types'
import { useCommunityList, messageOf } from '@/community/useCommunityList'
const status=ref<PostStatus|''>('')
const {rows,total,pageNo,size,query,loading,error,load,search}=useCommunityList<CommunityPost>('posts',()=>({status:status.value || undefined}))
const visible=ref(false), editing=ref(false), detailLoading=ref(false), detailError=ref(''), detail=ref<CommunityPost>(), saving=ref(false), saveError=ref(''), form=ref<FormInstance>()
const reviewConflict=ref(false)
const moderation=reactive({status:'PUBLISHED' as PostStatus,top:false,essence:false,reason:''})
async function open(id:number, edit:boolean){
  detail.value=undefined; detailError.value=''; saveError.value=''; reviewConflict.value=false; editing.value=edit; visible.value=true; detailLoading.value=true
  try { detail.value=(await request.get<ApiResult<CommunityPost>>(`/community/posts/${id}`)).data.data
    Object.assign(moderation,{status:detail.value.status,top:detail.value.top,essence:detail.value.essence,reason:''}); await nextTick(); form.value?.clearValidate()
  }catch(e){detailError.value=messageOf(e)}finally{detailLoading.value=false}
}
async function save(){
  if(saving.value || reviewConflict.value || !detail.value || !await form.value?.validate().catch(()=>false))return
  saving.value=true; saveError.value=''
  try{await request.put(`/community/posts/${detail.value.id}/moderation`,{...moderation,reason:moderation.reason.trim(),version:detail.value.version});visible.value=false;ElMessage.success('审核已保存，作者将收到通知');await load()}
  catch(e){saveError.value=messageOf(e);reviewConflict.value=(e as {response?:{status?:number}}).response?.status===409}finally{saving.value=false}
}
async function remove(post:CommunityPost){
  const result=await ElMessageBox.prompt(`将永久删除「${post.title}」及其评论、点赞和收藏。请填写删除原因。`,'删除帖子',{
    inputType:'textarea',inputValidator:value=>Boolean(value?.trim()) && value.length<=255 || '请填写 1 至 255 个字符的原因',confirmButtonText:'确认永久删除',cancelButtonText:'取消',type:'warning'
  }).catch(()=>null)
  if(!result || saving.value)return
  saving.value=true
  try{await request.delete(`/community/posts/${post.id}`,{params:{reason:result.value.trim()}});ElMessage.success('帖子已删除');await load()}catch{/* HTTP layer displays the failure. */}finally{saving.value=false}
}
</script>
<style scoped>.description{color:#606266}.el-pagination{margin-top:20px;justify-content:flex-end}.post-content{white-space:pre-wrap;overflow-wrap:anywhere;max-height:360px;overflow:auto;background:#f5f7fa;padding:16px;font:inherit}.moderation-form{margin-top:24px}.el-alert{margin-bottom:16px}.el-tag{margin-right:6px}</style>
