<template>
  <section>
    <h2>社区运营审计</h2>
    <p class="description">记录后台账号对社区资源的变更。审计记录仅供查询，无法在界面修改或删除。</p>
    <el-form inline @submit.prevent="search"><el-form-item><el-input v-model="query" placeholder="后台操作者、操作或资源" maxlength="100" clearable @keyup.enter="search" /></el-form-item><el-form-item><el-button :loading="loading" @click="search">搜索</el-button><el-button :disabled="loading" @click="load">刷新</el-button></el-form-item></el-form>
    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
    <el-table v-loading="loading" :data="rows" border empty-text="暂无符合条件的运营记录">
      <el-table-column prop="id" label="记录 ID" width="95" /><el-table-column prop="actor" label="后台操作者" min-width="140" />
      <el-table-column prop="action" label="操作" min-width="180" /><el-table-column prop="resource" label="社区资源" min-width="120" /><el-table-column prop="resourceId" label="资源 ID" width="100" />
      <el-table-column prop="detail" label="原因或变更摘要" min-width="260" show-overflow-tooltip />
      <el-table-column label="操作时间" min-width="175"><template #default="{row}">{{formatTime(row.createdAt)}}</template></el-table-column>
      <el-table-column label="详情" width="80" fixed="right"><template #default="{row}"><el-button link type="primary" @click="selected=row;visible=true">查看</el-button></template></el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageNo" v-model:page-size="size" :page-sizes="[10,20,50]" :total="total" layout="total, sizes, prev, pager, next" @current-change="load" @size-change="search" />
    <el-dialog v-model="visible" title="运营记录详情" width="min(680px,94vw)"><el-descriptions v-if="selected" :column="1" border>
      <el-descriptions-item label="后台操作者">{{selected.actor}}</el-descriptions-item><el-descriptions-item label="操作">{{selected.action}}</el-descriptions-item>
      <el-descriptions-item label="社区资源">{{selected.resource}} #{{selected.resourceId}}</el-descriptions-item><el-descriptions-item label="操作时间">{{formatTime(selected.createdAt)}}</el-descriptions-item>
      <el-descriptions-item label="原因或变更摘要"><pre class="audit-detail">{{selected.detail}}</pre></el-descriptions-item>
    </el-descriptions></el-dialog>
  </section>
</template>
<script setup lang="ts">
import {ref} from 'vue'
import {type AuditEntry,formatTime} from '@/community/types'
import {useCommunityList} from '@/community/useCommunityList'
const {rows,total,pageNo,size,query,loading,error,load,search}=useCommunityList<AuditEntry>('audit')
const selected=ref<AuditEntry>(),visible=ref(false)
</script>
<style scoped>.description{color:#606266}.el-pagination{margin-top:20px;justify-content:flex-end}.audit-detail{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}.el-alert{margin-bottom:16px}</style>
