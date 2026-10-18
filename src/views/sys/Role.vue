<template>
	<div>
		<el-form :inline="true">
			<el-form-item>
				<el-input
						v-model="searchForm.name"
						placeholder="名称"
						clearable
				>
				</el-input>
			</el-form-item>

			<el-form-item>
				<el-button @click="current = 1; getRoleList()">搜索</el-button>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="openCreate" v-if="hasAuth('sys:role:save')">新增</el-button>
			</el-form-item>
			<el-form-item>
				<el-popconfirm title="确定删除选中的记录？" @confirm="delHandle()">
					<template #reference><el-button type="danger" :disabled="!multipleSelection.length || busy" v-if="hasAuth('sys:role:delete')">批量删除</el-button></template>
				</el-popconfirm>
			</el-form-item>
		</el-form>

		<el-table

				:data="tableData"
				tooltip-effect="dark"
				style="width: 100%"
				border
				stripe
				@selection-change="handleSelectionChange">

			<!-- @vue-generic {SysRole} -->
      <el-table-column
					v-if="hasAuth('sys:role:delete')" :selectable="canSelect" type="selection"
					width="55">
			</el-table-column>

			<!-- @vue-generic {SysRole} -->
      <el-table-column
					prop="name"
					label="名称"
					width="120">
			</el-table-column>
			<!-- @vue-generic {SysRole} -->
      <el-table-column
					prop="code"
					label="唯一编码"
					show-overflow-tooltip>
			</el-table-column>
			<!-- @vue-generic {SysRole} -->
      <el-table-column
					prop="remark"
					label="描述"
					show-overflow-tooltip>
			</el-table-column>

			<!-- @vue-generic {SysRole} -->
      <el-table-column
					prop="statu"
					label="状态">
				<template #default="scope">
					<el-tag size="small" v-if="scope.row.statu === 1" type="success">正常</el-tag>
					<el-tag size="small" v-else-if="scope.row.statu === 0" type="danger">禁用</el-tag>
				</template>

			</el-table-column>
			<!-- @vue-generic {SysRole} -->
      <el-table-column
					v-if="canOperate" prop="icon"
					label="操作">

				<template #default="scope">
					<el-button link type="primary" v-if="hasAuth('sys:role:perm')" :disabled="!canSelect(scope.row)" @click="permHandle(scope.row.id)">分配权限</el-button>


					<el-button link type="primary" v-if="hasAuth('sys:role:update')" :disabled="!canSelect(scope.row)" @click="editHandle(scope.row.id)">编辑</el-button>



						<el-popconfirm v-if="hasAuth('sys:role:delete') &amp;&amp; canSelect(scope.row)" title="确定删除这条记录？" @confirm="delHandle(scope.row.id)">
							<template #reference><el-button link type="primary">删除</el-button></template>
						</el-popconfirm>


				</template>
			</el-table-column>

		</el-table>


		<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				layout="total, sizes, prev, pager, next, jumper"
				:page-sizes="[10, 20, 50, 100]"
				v-model:current-page="current"
				v-model:page-size="size"
				:total="total">
		</el-pagination>


		<!--新增对话框-->
		<el-dialog
				:title="editForm.id ? '编辑角色' : '新增角色'"
				v-model="dialogVisible"
				width="min(600px, 94vw)"
				:before-close="handleClose">

			<el-form :model="editForm" :rules="editFormRules" ref="formRef" label-width="100px" class="demo-editForm">

				<el-form-item label="角色名称" prop="name" label-width="100px">
					<el-input v-model="editForm.name" autocomplete="off"></el-input>
				</el-form-item>

				<el-form-item label="唯一编码" prop="code" label-width="100px">
					<el-input v-model="editForm.code" autocomplete="off"></el-input>
				</el-form-item>

				<el-form-item label="描述" prop="remark" label-width="100px">
					<el-input v-model="editForm.remark" autocomplete="off"></el-input>
				</el-form-item>


				<el-form-item label="状态" prop="statu" label-width="100px">
					<el-radio-group v-model="editForm.statu">
						<el-radio :value=0>禁用</el-radio>
						<el-radio :value=1>正常</el-radio>
					</el-radio-group>
				</el-form-item>

				<el-form-item>
					<el-button type="primary" :loading="busy" @click="submitForm('editForm')">保存</el-button>
					<el-button @click="resetForm('editForm')">取消</el-button>
				</el-form-item>
			</el-form>

		</el-dialog>

		<el-dialog
				title="分配权限"
				v-model="permDialogVisible"
				width="min(600px, 94vw)">

			<el-form :model="permForm">

				<el-tree
						:data="permTreeData"
						show-checkbox
						ref="permTree"
						:default-expand-all=true
						node-key="id"
						:check-strictly=true
						:props="defaultProps">
				</el-tree>

			</el-form>

			<template #footer><span class="dialog-footer">
			    <el-button @click="permDialogVisible = false">取 消</el-button>
			    <el-button type="primary" :loading="busy" @click="submitPermFormHandle('permForm')">确 定</el-button>
			</span></template>

		</el-dialog>

	</div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type TreeInstance } from 'element-plus'
import request from '@/axios'
import { hasAuth } from '@/globalFun'
import { useOperation } from '@/composables/useOperation'
import type { SysRole, SysMenu, Page, ApiResult } from '@/types'
const { busy, run } = useOperation()
const canOperate = computed(() => ['update', 'delete', 'perm'].some(action => hasAuth(`sys:role:${action}`)))
const searchForm = reactive({ name: '' })
const current = ref(1), size = ref(10), total = ref(0)
const tableData = ref<SysRole[]>([]), multipleSelection = ref<SysRole[]>([])
const dialogVisible = ref(false), permDialogVisible = ref(false)
const emptyRole = (): Partial<SysRole> => ({ name: '', code: '', remark: '', statu: 1 })
const editForm = ref(emptyRole()), permForm = ref<Partial<SysRole>>({})
const formRef = ref<FormInstance>(), permTree = ref<TreeInstance>()
const permTreeData = ref<SysMenu[]>([])
const defaultProps = { children: 'children', label: 'name' }
const editFormRules: FormRules = {
  name: [{ required: true, max: 64, message: '请输入角色名称（最多 64 个字符）', trigger: 'blur' }],
  code: [{ required: true, pattern: /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/, message: '以字母开头，可含数字、下划线和连字符，最多 64 位', trigger: 'blur' }],
  statu: [{ required: true, message: '请选择状态' }]
}
const canSelect = (row: SysRole) => row.code !== 'admin'
function handleSelectionChange(rows: SysRole[]) { multipleSelection.value = rows }
async function loadRoles() {
  const { data } = await request.get<ApiResult<Page<SysRole>>>('/sys/role/list', { params: { ...searchForm, current: current.value, size: size.value } })
  tableData.value = data.data.records; total.value = data.data.total
}
function getRoleList() { return run(loadRoles) }
function handleSizeChange(value: number) { size.value = value; current.value = 1; getRoleList() }
function handleCurrentChange(value: number) { current.value = value; getRoleList() }
function openCreate() { editForm.value = emptyRole(); dialogVisible.value = true; nextTick(() => formRef.value?.clearValidate()) }
function resetForm(_name?: string) { dialogVisible.value = false; editForm.value = emptyRole(); formRef.value?.clearValidate() }
function handleClose() { resetForm() }
async function submitForm(_name: string) {
  if (!await formRef.value?.validate().catch(() => false)) return
  await run(async () => {
    await request.post('/sys/role/' + (editForm.value.id ? 'update' : 'save'), editForm.value)
    ElMessage.success('角色已保存'); resetForm(); await loadRoles()
  })
}
function editHandle(id: number) { return run(async () => {
  editForm.value = (await request.get<ApiResult<SysRole>>('/sys/role/info/' + id)).data.data
  dialogVisible.value = true; await nextTick(); formRef.value?.clearValidate()
}) }
function delHandle(id?: number) { return run(async () => {
  await request.post('/sys/role/delete', id ? [id] : multipleSelection.value.map(row => row.id))
  ElMessage.success('角色已删除'); await loadRoles()
}) }
function permHandle(id: number) { return run(async () => {
  const [role, menus] = await Promise.all([
    request.get<ApiResult<SysRole>>('/sys/role/info/' + id), request.get<ApiResult<SysMenu[]>>('/sys/menu/list')
  ])
  permForm.value = role.data.data; permTreeData.value = menus.data.data
  permDialogVisible.value = true; await nextTick(); permTree.value?.setCheckedKeys(role.data.data.menuIds)
}) }
function submitPermFormHandle(_name: string) { return run(async () => {
  await request.post('/sys/role/perm/' + permForm.value.id, permTree.value?.getCheckedKeys() || [])
  ElMessage.success('权限已更新'); permDialogVisible.value = false
}) }
onMounted(getRoleList)
</script>
<style scoped>.el-pagination { margin-top: 22px; justify-content: flex-end; }</style>
