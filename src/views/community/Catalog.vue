<template>
  <section>
    <h2>{{ config.title }}</h2><p class="description">{{ config.description }}</p>
    <el-form inline @submit.prevent="search">
      <el-form-item><el-input v-model="query" :placeholder="config.search" maxlength="100" clearable @keyup.enter="search" /></el-form-item>
      <el-form-item><el-button :loading="loading" @click="search">搜索</el-button><el-button :disabled="loading" @click="load">刷新</el-button></el-form-item>
      <el-form-item><el-button type="primary" :disabled="saving || !can('create')" @click="create">新增{{config.singular}}</el-button></el-form-item>
    </el-form>
    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
    <el-table v-loading="loading" :data="rows" border :empty-text="'暂无符合条件的'+config.singular">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column v-for="column in config.columns" :key="column.key" :prop="column.key" :label="column.label" :min-width="column.width || 180" show-overflow-tooltip>
        <template #default="{row}">
          <el-tag v-if="column.kind==='boolean'" :type="row[column.key] ? 'success' : 'info'">{{row[column.key] ? '启用' : '停用'}}</el-tag>
          <span v-else-if="column.kind==='date'">{{formatTime(row[column.key])}}</span>
          <span v-else>{{row[column.key] ?? '—'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="185" fixed="right"><template #default="{row}">
        <el-button link type="primary" @click="open(row.id,false)">详情</el-button>
        <el-button link type="primary" :disabled="saving || !can('update')" @click="open(row.id,true)">编辑</el-button>
        <el-button link type="danger" :disabled="saving || !can('delete') || (resource==='tags' && row.topicCount>0)" @click="remove(row)">删除</el-button>
      </template></el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageNo" v-model:page-size="size" :page-sizes="[10,20,50]" :total="total" layout="total, sizes, prev, pager, next" @current-change="load" @size-change="search" />
    <el-dialog v-model="visible" :title="(readonly ? '查看' : selectedId ? '编辑' : '新增')+config.singular" width="min(680px,94vw)" :close-on-click-modal="!saving" :close-on-press-escape="!saving" :show-close="!saving">
      <div v-loading="detailLoading">
        <el-alert v-if="detailError" :title="detailError" type="error" :closable="false" />
        <el-form v-if="!detailError" ref="form" :model="draft" :disabled="readonly || saving" label-position="top">
          <el-form-item v-for="field in config.fields" :key="field.key" :label="field.label" :prop="field.key" :rules="rulesFor(field)">
            <el-switch v-if="field.kind==='boolean'" v-model="draft[field.key]" active-text="启用" inactive-text="停用" />
            <el-input v-else v-model="draft[field.key]" :type="field.kind==='textarea' ? 'textarea' : 'text'" :rows="4" :maxlength="field.max" show-word-limit :placeholder="field.placeholder || ''" />
          </el-form-item>
          <p v-if="resource==='tags' && selectedId" class="description">标签被帖子使用时无法删除。重命名会同步影响所有关联帖子。</p>
        </el-form>
        <el-alert v-if="saveError" :title="saveError" type="error" :closable="false" />
      </div>
      <template #footer><el-button :disabled="saving" @click="visible=false">{{readonly ? '关闭' : '取消'}}</el-button><el-button v-if="!readonly" type="primary" :disabled="detailLoading || Boolean(detailError) || !can(selectedId ? 'update':'create')" :loading="saving" @click="save">保存</el-button></template>
    </el-dialog>
  </section>
</template>
<script setup lang="ts">
import {ref,reactive,nextTick} from 'vue'
import {ElMessage,ElMessageBox,type FormInstance,type FormItemRule} from 'element-plus'
import request from '@/axios'
import {hasAuth} from '@/globalFun'
import type {ApiResult} from '@/types'
import {type CatalogResource,type CatalogItem,formatTime} from '@/community/types'
import {useCommunityList,messageOf} from '@/community/useCommunityList'
interface Field {key:string;label:string;kind?:'textarea'|'boolean';max?:number;required?:boolean;placeholder?:string}
interface Column {key:string;label:string;width?:number;kind?:'boolean'|'date'}
interface Config {title:string;singular:string;permission:string;description:string;search:string;fields:Field[];columns:Column[]}
const props=defineProps<{resource:CatalogResource}>()
const resource=props.resource
const configs:Record<CatalogResource,Config>={
  billboards:{title:'社区公告',singular:'公告',permission:'billboard',description:'维护社区首页公告。停用后不再公开展示。',search:'搜索公告内容',fields:[{key:'content',label:'公告内容',kind:'textarea',max:255,required:true},{key:'visible',label:'展示状态',kind:'boolean'}],columns:[{key:'content',label:'公告内容',width:320},{key:'visible',label:'展示状态',kind:'boolean',width:100},{key:'createTime',label:'创建时间',kind:'date'}]},
  tips:{title:'社区提示语',singular:'提示语',permission:'tip',description:'维护社区展示的提示语和署名。仅启用的提示语参与展示。',search:'搜索提示语或署名',fields:[{key:'content',label:'提示语内容',kind:'textarea',max:255,required:true},{key:'author',label:'署名',max:255},{key:'enabled',label:'展示状态',kind:'boolean'}],columns:[{key:'content',label:'提示语',width:300},{key:'author',label:'署名'},{key:'enabled',label:'展示状态',kind:'boolean',width:100}]},
  promotions:{title:'社区推广链接',singular:'推广链接',permission:'promotion',description:'维护社区资源推荐。链接仅支持 http 或 https，请确认目标内容适合公开展示。',search:'搜索标题或描述',fields:[{key:'title',label:'标题',max:255,required:true},{key:'link',label:'链接',max:255,required:true,placeholder:'https://example.com'},{key:'description',label:'描述',kind:'textarea',max:255}],columns:[{key:'title',label:'标题'},{key:'link',label:'链接',width:260},{key:'description',label:'描述',width:220}]},
  tags:{title:'社区标签',singular:'标签',permission:'tag',description:'维护帖子标签。名称会转为小写；已被帖子使用的标签不能删除。',search:'搜索标签名称',fields:[{key:'name',label:'标签名称',max:32,required:true}],columns:[{key:'name',label:'名称',width:250},{key:'topicCount',label:'关联帖子数',width:130}]}
}
const config=configs[resource]
const can=(action:string)=>hasAuth(`community:${config.permission}:${action}`)
const {rows,total,pageNo,size,query,loading,error,load,search}=useCommunityList<CatalogItem>(resource)
const visible=ref(false),readonly=ref(false),selectedId=ref<number>(),detailLoading=ref(false),detailError=ref(''),saving=ref(false),saveError=ref(''),form=ref<FormInstance>()
const draft=reactive<Record<string,string|boolean>>({})
function populate(item?:CatalogItem){
  for(const key of Object.keys(draft))delete draft[key]
  for(const field of config.fields){const value=item?.[field.key as keyof CatalogItem];draft[field.key]=field.kind==='boolean' ? value===true : String(value ?? '')}
}
function rulesFor(field:Field):FormItemRule[]{
  const rules:FormItemRule[]=[]
  if(field.required)rules.push({required:true,whitespace:true,message:`请填写${field.label}`,trigger:'blur'})
  if(field.max)rules.push({max:field.max,message:`最多 ${field.max} 个字符`,trigger:'blur'})
  if(field.key==='link')rules.push({validator:(_rule,value,done)=>{try{const url=new URL(String(value));if(!['http:','https:'].includes(url.protocol) || !url.hostname || url.username || url.password)throw new Error();done()}catch{done(new Error('请输入有效的 http 或 https 链接'))}},trigger:'blur'})
  return rules
}
async function create(){selectedId.value=undefined;readonly.value=false;detailError.value='';saveError.value='';populate();visible.value=true;await nextTick();form.value?.clearValidate()}
async function open(id:number,edit:boolean){
  selectedId.value=id;readonly.value=!edit;detailError.value='';saveError.value='';populate();visible.value=true;detailLoading.value=true
  try{populate((await request.get<ApiResult<CatalogItem>>(`/community/${resource}/${id}`)).data.data);await nextTick();form.value?.clearValidate()}
  catch(e){detailError.value=messageOf(e)}finally{detailLoading.value=false}
}
async function save(){
  if(saving.value || !await form.value?.validate().catch(()=>false))return
  saving.value=true;saveError.value=''
  try{const payload=Object.fromEntries(Object.entries(draft).map(([key,value])=>[key,typeof value==='string'?value.trim():value]));
    if(selectedId.value)await request.put(`/community/${resource}/${selectedId.value}`,payload);else await request.post(`/community/${resource}`,payload)
    visible.value=false;ElMessage.success(`${config.singular}已保存`);await load()
  }catch(e){saveError.value=messageOf(e)}finally{saving.value=false}
}
async function remove(item:CatalogItem){
  const confirmed=await ElMessageBox.confirm(`确定删除${config.singular} #${item.id}？此操作无法撤销。`,'删除确认',{type:'warning',confirmButtonText:'确认删除',cancelButtonText:'取消'}).then(()=>true).catch(()=>false)
  if(!confirmed || saving.value)return
  saving.value=true
  try{await request.delete(`/community/${resource}/${item.id}`);ElMessage.success(`${config.singular}已删除`);await load()}catch{/* HTTP layer displays the failure. */}finally{saving.value=false}
}
</script>
<style scoped>.description{color:#606266}.el-pagination{margin-top:20px;justify-content:flex-end}.el-alert{margin-bottom:16px}</style>
