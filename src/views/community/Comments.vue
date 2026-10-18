<template>
  <section>
    <h2>评论管理</h2>
    <p class="description">隐藏主评论会同时隐藏其回复；删除评论会永久删除关联回复。所有操作均记录原因。</p>
    <el-form inline @submit.prevent="search">
      <el-form-item><el-input v-model="query" placeholder="评论内容或社区作者" maxlength="100" clearable @keyup.enter="search" /></el-form-item>
      <el-form-item label="帖子 ID"><el-input-number v-model="postId" :min="1" :max="2147483647" :precision="0" :controls="false" placeholder="全部帖子" /></el-form-item>
      <el-form-item><el-button :loading="loading" @click="search">搜索</el-button><el-button @click="query='';postId=undefined;search()">重置</el-button></el-form-item>
    </el-form>
    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
    <el-table v-loading="loading" :data="rows" border empty-text="暂无符合条件的评论">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="content" label="评论内容" min-width="260" show-overflow-tooltip />
      <el-table-column prop="username" label="社区作者" min-width="130" />
      <el-table-column prop="postTitle" label="所属帖子" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="95"><template #default="{row}"><el-tag :type="row.visible ? 'success' : 'danger'">{{row.visible ? '可见' : '已隐藏'}}</el-tag></template></el-table-column>
      <el-table-column label="发表时间" min-width="175"><template #default="{row}">{{formatTime(row.createdAt)}}</template></el-table-column>
      <el-table-column label="操作" fixed="right" width="190"><template #default="{row}">
        <el-button link type="primary" @click="open(row.id,false)">详情</el-button>
        <el-button link type="primary" :disabled="saving || !hasAuth('community:comment:moderate')" @click="open(row.id,true)">管理</el-button>
        <el-button link type="danger" :disabled="saving || !hasAuth('community:comment:delete')" @click="remove(row)">删除</el-button>
      </template></el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageNo" v-model:page-size="size" :page-sizes="[10,20,50]" :total="total" layout="total, sizes, prev, pager, next" @current-change="load" @size-change="search" />
    <el-dialog v-model="visible" :title="editing ? '管理评论' : '评论详情'" width="min(720px,94vw)" :close-on-click-modal="!saving" :close-on-press-escape="!saving" :show-close="!saving">
      <div v-loading="detailLoading">
        <el-alert v-if="detailError" :title="detailError" type="error" :closable="false" />
        <template v-if="detail">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="社区作者">{{detail.username}}</el-descriptions-item>
            <el-descriptions-item label="所属帖子">#{{detail.postId}} {{detail.postTitle}}</el-descriptions-item>
            <el-descriptions-item label="回复评论">{{detail.parentId ? '#'+detail.parentId : '主评论'}}</el-descriptions-item>
            <el-descriptions-item label="内容"><span class="text-content">{{detail.content}}</span></el-descriptions-item>
            <el-descriptions-item label="发表时间">{{formatTime(detail.createdAt)}}</el-descriptions-item>
          </el-descriptions>
          <el-form v-if="editing" ref="form" :model="moderation" label-width="100px" class="moderation-form">
            <el-form-item label="展示状态"><el-radio-group v-model="moderation.visible"><el-radio :value="true">恢复可见</el-radio><el-radio :value="false">隐藏</el-radio></el-radio-group></el-form-item>
            <el-form-item label="操作原因" prop="reason" :rules="[{required:true,whitespace:true,message:'请填写操作原因',trigger:'blur'}]"><el-input v-model="moderation.reason" type="textarea" :rows="3" maxlength="255" show-word-limit /></el-form-item>
          </el-form>
          <el-alert v-if="saveError" :title="saveError" type="error" :closable="false" />
        </template>
      </div>
      <template #footer><el-button :disabled="saving" @click="visible=false">{{editing ? '取消' : '关闭'}}</el-button><el-button v-if="editing" type="primary" :disabled="!detail || detailLoading || !hasAuth('community:comment:moderate')" :loading="saving" @click="save">确认保存</el-button></template>
    </el-dialog>
  </section>
</template>
<script setup lang="ts">
import {ref,reactive,nextTick} from 'vue'
import {ElMessage,ElMessageBox,type FormInstance} from 'element-plus'
import request from '@/axios'
import {hasAuth} from '@/globalFun'
import type {ApiResult} from '@/types'
import {type CommunityComment,formatTime} from '@/community/types'
import {useCommunityList,messageOf} from '@/community/useCommunityList'
const postId=ref<number>()
const {rows,total,pageNo,size,query,loading,error,load,search}=useCommunityList<CommunityComment>('comments',()=>({postId:postId.value}))
const visible=ref(false),editing=ref(false),detailLoading=ref(false),detailError=ref(''),detail=ref<CommunityComment>(),saving=ref(false),saveError=ref(''),form=ref<FormInstance>()
const moderation=reactive({visible:true,reason:''})
async function open(id:number,edit:boolean){
  detail.value=undefined;detailError.value='';saveError.value='';visible.value=true;editing.value=edit;detailLoading.value=true
  try{detail.value=(await request.get<ApiResult<CommunityComment>>(`/community/comments/${id}`)).data.data;Object.assign(moderation,{visible:detail.value.visible,reason:''});await nextTick();form.value?.clearValidate()}
  catch(e){detailError.value=messageOf(e)}finally{detailLoading.value=false}
}
async function save(){
  if(saving.value || !detail.value || !await form.value?.validate().catch(()=>false))return
  saving.value=true;saveError.value=''
  try{await request.put(`/community/comments/${detail.value.id}/visibility`,{...moderation,reason:moderation.reason.trim()});visible.value=false;ElMessage.success('评论状态已更新');await load()}
  catch(e){saveError.value=messageOf(e)}finally{saving.value=false}
}
async function remove(comment:CommunityComment){
  const result=await ElMessageBox.prompt(`将永久删除评论 #${comment.id} 及其回复。请填写删除原因。`,'删除评论',{
    inputType:'textarea',inputValidator:value=>Boolean(value?.trim()) && value.length<=255 || '请填写 1 至 255 个字符的原因',confirmButtonText:'确认永久删除',cancelButtonText:'取消',type:'warning'
  }).catch(()=>null)
  if(!result || saving.value)return
  saving.value=true
  try{await request.delete(`/community/comments/${comment.id}`,{params:{reason:result.value.trim()}});ElMessage.success('评论已删除');await load()}catch{/* HTTP layer displays the failure. */}finally{saving.value=false}
}
</script>
<style scoped>.description{color:#606266}.el-pagination{margin-top:20px;justify-content:flex-end}.text-content{white-space:pre-wrap;overflow-wrap:anywhere}.moderation-form{margin-top:24px}.el-alert{margin-bottom:16px}</style>
