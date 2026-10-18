<template>
	<div>
    <h2>后台账号</h2>
    <p style="color:#606266">管理后台登录账号及角色。社区注册用户请在「社区运营 → 社区账号」中维护。</p>
		<el-form :inline="true">
			<el-form-item>
				<el-input
						v-model="searchForm.username"
						placeholder="后台用户名"
						clearable
				>
				</el-input>
			</el-form-item>

			<el-form-item>
				<el-button @click="current = 1; getUserList()">搜索</el-button>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="openCreate" v-if="hasAuth('sys:user:save')">新增</el-button>
			</el-form-item>
			<el-form-item>
				<el-popconfirm title="确定删除选中的记录？" @confirm="delHandle()">
					<template #reference><el-button type="danger" :disabled="!multipleSelection.length || busy" v-if="hasAuth('sys:user:delete')">批量删除</el-button></template>
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

			<el-table-column
					v-if="hasAuth('sys:user:delete')" :selectable="canSelect" type="selection"
					width="55">
			</el-table-column>

			<el-table-column
					label="头像"
					width="65">
				<template #default="scope">
					<el-avatar size="small" :src="scope.row.avatar"></el-avatar>
				</template>
			</el-table-column>

			<el-table-column
					prop="username"
					label="后台用户名"
					width="120">
			</el-table-column>
			<el-table-column
					prop="code"
					label="角色名称">
				<template #default="scope">
					<el-tag size="small" type="info" v-for="(item,index) in scope.row.roles" :key="index">{{item.name}}</el-tag>
				</template>

			</el-table-column>
			<el-table-column
					prop="email"
					label="邮箱">
			</el-table-column>
			<el-table-column
					prop="phone"
					label="手机号">
			</el-table-column>

			<el-table-column
					prop="statu"
					label="状态">
				<template #default="scope">
					<el-tag size="small" v-if="scope.row.statu === 1" type="success">正常</el-tag>
					<el-tag size="small" v-else-if="scope.row.statu === 0" type="danger">禁用</el-tag>
				</template>

			</el-table-column>
			<el-table-column
					prop="created"
					width="200"
					label="创建时间"
			>
        <template #default="scope">{{ formatDate(scope.row.created) }}</template>
			</el-table-column>
			<el-table-column
					v-if="canOperate" prop="icon"
					width="260px"
					label="操作">

				<template #default="scope">
					<el-button link type="primary" v-if="hasAuth('sys:user:role')" :disabled="!canSelect(scope.row)" @click="roleHandle(scope.row.id)">分配角色</el-button>


					<el-button link type="primary" v-if="hasAuth('sys:user:repass')" :disabled="!canSelect(scope.row)" @click="repassHandle(scope.row.id, scope.row.username)">重置密码</el-button>


					<el-button link type="primary" v-if="hasAuth('sys:user:update')" :disabled="!canSelect(scope.row)" @click="editHandle(scope.row.id)">编辑</el-button>



						<el-popconfirm v-if="hasAuth('sys:user:delete') &amp;&amp; canSelect(scope.row)" title="确定删除这条记录？" @confirm="delHandle(scope.row.id)">
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
				:title="editForm.id ? '编辑后台账号' : '新增后台账号'"
				v-model="dialogVisible"
				width="min(600px, 94vw)"
				:before-close="handleClose">

			<el-form :model="editForm" :rules="editFormRules" ref="formRef">
				<el-form-item label="后台用户名" prop="username" label-width="100px">
					<el-input v-model="editForm.username" autocomplete="off"></el-input>
				</el-form-item>

				<el-form-item v-if="!editForm.id" label="初始密码" prop="password" label-width="100px">
          <el-input v-model="editForm.password" type="password" show-password autocomplete="new-password" maxlength="72" />
        </el-form-item>
        <el-form-item label="邮箱"  prop="email" label-width="100px">
					<el-input v-model="editForm.email" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="手机号"  prop="phone" label-width="100px">
					<el-input v-model="editForm.phone" autocomplete="off"></el-input>
				</el-form-item>

				<el-form-item label="状态"  prop="statu" label-width="100px">
					<el-radio-group v-model="editForm.statu">
						<el-radio :value="0">禁用</el-radio>
						<el-radio :value="1">正常</el-radio>
					</el-radio-group>
				</el-form-item>

			</el-form>
			<template #footer><div class="dialog-footer">
				<el-button @click="resetForm('editForm')">取 消</el-button>
				<el-button type="primary" :loading="busy" @click="submitForm('editForm')">确 定</el-button>
			</div></template>
		</el-dialog>

		<!-- 分配权限对话框 -->
		<el-dialog title="分配角色" v-model="roleDialogFormVisible" width="min(600px, 94vw)">

			<el-form :model="roleForm">
				<el-tree
						:data="roleTreeData"
						show-checkbox
						ref="roleTree"
						check-strictly
						node-key="id"
						:default-expand-all=true
						:props="defaultProps">
				</el-tree>
			</el-form>

			<template #footer><div class="dialog-footer">
				<el-button @click="roleDialogFormVisible=false">取 消</el-button>
				<el-button type="primary" :loading="busy" @click="submitRoleHandle('roleForm')">确 定</el-button>
			</div></template>
		</el-dialog>

	</div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type TreeInstance } from 'element-plus'
import request from '@/axios'
import { hasAuth } from '@/globalFun'
import { useOperation } from '@/composables/useOperation'
import type { SysUser, SysRole, Page, ApiResult } from '@/types'
const { busy, run } = useOperation()
const canOperate = computed(() => ['update', 'delete', 'role', 'repass'].some(action => hasAuth(`sys:user:${action}`)))
const searchForm = reactive({ username: '' })
const current = ref(1), size = ref(10), total = ref(0)
const tableData = ref<SysUser[]>([]), multipleSelection = ref<SysUser[]>([])
const dialogVisible = ref(false), roleDialogFormVisible = ref(false)
const emptyUser = (): Partial<SysUser> => ({ username: '', password: '', email: '', phone: '', statu: 1 })
const editForm = ref(emptyUser()), roleForm = ref<Partial<SysUser>>({})
const formRef = ref<FormInstance>(), roleTree = ref<TreeInstance>()
const roleTreeData = ref<SysRole[]>([])
const defaultProps = { children: 'children', label: 'name' }
const editFormRules: FormRules = {
  username: [{ required: true, max: 64, message: '请输入用户名（最多 64 个字符）', trigger: 'blur' }],
  password: [{ required: true, min: 8, max: 72, message: '密码至少 8 个字符，最多 72 字节', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入有效邮箱', trigger: 'blur' }],
  statu: [{ required: true, message: '请选择状态' }]
}
const formatDate = (value: string | number | null) => value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—'
const canSelect = (row: SysUser) => row.id !== 1 && (hasAuth('ROLE_ADMIN') || !row.roles?.some(role => role.code === 'admin'))
function handleSelectionChange(rows: SysUser[]) { multipleSelection.value = rows }
async function loadUsers() {
  const { data } = await request.get<ApiResult<Page<SysUser>>>('/sys/user/list', { params: { ...searchForm, current: current.value, size: size.value } })
  tableData.value = data.data.records; total.value = data.data.total
}
function getUserList() { return run(loadUsers) }
function handleSizeChange(value: number) { size.value = value; current.value = 1; getUserList() }
function handleCurrentChange(value: number) { current.value = value; getUserList() }
function openCreate() { editForm.value = emptyUser(); dialogVisible.value = true; nextTick(() => formRef.value?.clearValidate()) }
function resetForm(_name?: string) { dialogVisible.value = false; editForm.value = emptyUser(); formRef.value?.clearValidate() }
function handleClose() { resetForm() }
async function submitForm(_name: string) {
  if (!await formRef.value?.validate().catch(() => false)) return
  await run(async () => {
    await request.post('/sys/user/' + (editForm.value.id ? 'update' : 'save'), editForm.value)
    ElMessage.success('用户已保存'); resetForm(); await loadUsers()
  })
}
function editHandle(id: number) { return run(async () => {
  editForm.value = (await request.get<ApiResult<SysUser>>('/sys/user/info/' + id)).data.data
  dialogVisible.value = true; await nextTick(); formRef.value?.clearValidate()
}) }
function delHandle(id?: number) { return run(async () => {
  await request.post('/sys/user/delete', id ? [id] : multipleSelection.value.map(row => row.id))
  ElMessage.success('用户已删除'); await loadUsers()
}) }
function roleHandle(id: number) { return run(async () => {
  const [user, roles] = await Promise.all([
    request.get<ApiResult<SysUser>>('/sys/user/info/' + id), request.get<ApiResult<SysRole[]>>('/sys/role/options')
  ])
  roleForm.value = user.data.data; roleTreeData.value = roles.data.data
  roleDialogFormVisible.value = true; await nextTick()
  roleTree.value?.setCheckedKeys(user.data.data.roles.map(role => role.id))
}) }
function submitRoleHandle(_name: string) { return run(async () => {
  await request.post('/sys/user/role/' + roleForm.value.id, roleTree.value?.getCheckedKeys() || [])
  ElMessage.success('角色已分配，用户需重新登录'); roleDialogFormVisible.value = false; await loadUsers()
}) }
async function repassHandle(id: number, username: string) {
  const result = await ElMessageBox.prompt(`为 ${username} 设置新密码`, '重置密码', {
    inputType: 'password', inputPattern: /^.{8,72}$/u, inputErrorMessage: '请输入 8 至 72 个字符的密码',
    confirmButtonText: '重置', cancelButtonText: '取消'
  }).catch(() => null)
  if (result) await run(async () => {
    await request.post('/sys/user/repass', { id, password: result.value }); ElMessage.success('密码已重置，旧登录已失效')
  })
}
onMounted(getUserList)
</script>
<style scoped>.el-pagination { margin-top: 22px; justify-content: flex-end; }</style>
