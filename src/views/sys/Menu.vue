<template>
	<div>

		<el-form :inline="true">
			<el-form-item>
				<el-button type="primary" v-if="hasAuth('ROLE_ADMIN')" @click="openCreate">新增</el-button>
			</el-form-item>
		</el-form>

		<el-table
				:data="tableData"
				style="width: 100%;margin-bottom: 20px;"
				row-key="id"
				border
				stripe
				default-expand-all
				:tree-props="{children: 'children', hasChildren: 'hasChildren'}">

			<el-table-column
					prop="name"
					label="名称"
					sortable
					width="180">
			</el-table-column>
			<el-table-column
					prop="perms"
					label="权限编码"
					sortable
					width="180">
			</el-table-column>

			<el-table-column
					prop="icon"
					label="图标">
			</el-table-column>

			<el-table-column
					prop="type"
					label="类型">
				<template #default="scope">
					<el-tag size="small" v-if="scope.row.type === 0">目录</el-tag>
					<el-tag size="small" v-else-if="scope.row.type === 1" type="success">菜单</el-tag>
					<el-tag size="small" v-else-if="scope.row.type === 2" type="info">按钮</el-tag>
				</template>

			</el-table-column>

			<el-table-column
					prop="path"
					label="菜单URL">
			</el-table-column>
			<el-table-column
					prop="component"
					label="菜单组件">
			</el-table-column>
			<el-table-column
					prop="orderNum"
					label="排序号">
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
					prop="icon"
					label="操作">

				<template #default="scope">
					<el-button link type="primary" v-if="hasAuth('ROLE_ADMIN')" :disabled="scope.row.id <= 16 || scope.row.builtin" @click="editHandle(scope.row.id)">编辑</el-button>



						<el-popconfirm v-if="hasAuth('ROLE_ADMIN') &amp;&amp; scope.row.id > 16 &amp;&amp; !scope.row.builtin" title="确定删除这条记录？" @confirm="delHandle(scope.row.id)">
							<template #reference><el-button link type="primary">删除</el-button></template>
						</el-popconfirm>


				</template>
			</el-table-column>

		</el-table>


		<!--新增对话框-->
		<el-dialog
				:title="editForm.id ? '编辑菜单' : '新增菜单'"
				v-model="dialogVisible"
				width="min(600px, 94vw)"
				:before-close="handleClose">

			<el-form :model="editForm" :rules="editFormRules" ref="formRef" label-width="100px" class="demo-editForm">

				<el-form-item label="上级菜单" prop="parentId">
					<el-tree-select v-model="editForm.parentId" :data="parentOptions" node-key="id"
            :props="{ label: 'name', children: 'children' }" check-strictly default-expand-all />
				</el-form-item>

				<el-form-item label="菜单名称" prop="name" label-width="100px">
					<el-input v-model="editForm.name" autocomplete="off"></el-input>
				</el-form-item>

				<el-form-item label="权限编码" prop="perms" label-width="100px">
					<el-input v-model="editForm.perms" autocomplete="off"></el-input>
				</el-form-item>

				<el-form-item label="图标" prop="icon" label-width="100px">
					<el-input v-model="editForm.icon" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item v-if="editForm.type === 1" label="菜单URL" prop="path" label-width="100px">
					<el-input v-model="editForm.path" placeholder="/sys/页面名称 或 /community/页面名称" autocomplete="off"></el-input>
				</el-form-item>

				<el-form-item v-if="editForm.type === 1" label="菜单组件" prop="component" label-width="100px">
					<el-select v-model="editForm.component" clearable placeholder="选择管理页面">
            <el-option v-for="page in communityPages" :key="page.value" :label="page.label" :value="page.value" />
            <el-option label="用户管理" value="sys/User" /><el-option label="角色管理" value="sys/Role" /><el-option label="菜单管理" value="sys/Menu" />
          </el-select>
				</el-form-item>

				<el-form-item label="类型" prop="type" label-width="100px">
					<el-radio-group v-model="editForm.type">
						<el-radio :value=0>目录</el-radio>
						<el-radio :value=1>菜单</el-radio>
						<el-radio :value=2>按钮</el-radio>
					</el-radio-group>
				</el-form-item>

				<el-form-item label="状态" prop="statu" label-width="100px">
					<el-radio-group v-model="editForm.statu">
						<el-radio :value=0>禁用</el-radio>
						<el-radio :value=1>正常</el-radio>
					</el-radio-group>
				</el-form-item>

				<el-form-item label="排序号" prop="orderNum" label-width="100px">
					<el-input-number v-model="editForm.orderNum" :min="1" label="排序号">1</el-input-number>
				</el-form-item>


				<el-form-item>
					<el-button type="primary" :loading="busy" @click="submitForm('editForm')">保存</el-button>
					<el-button @click="resetForm('editForm')">取消</el-button>
				</el-form-item>
			</el-form>

		</el-dialog>


	</div>

</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import request from '@/axios'
import { hasAuth } from '@/globalFun'
import { useOperation } from '@/composables/useOperation'
import type { SysMenu, ApiResult } from '@/types'
const communityPages = [{ label: '社区账号', value: 'community/Users' }, { label: '帖子审核', value: 'community/Posts' }, { label: '评论管理', value: 'community/Comments' }, { label: '社区公告', value: 'community/Billboards' }, { label: '社区提示语', value: 'community/Tips' }, { label: '推广链接', value: 'community/Promotions' }, { label: '社区标签', value: 'community/Tags' }, { label: '运营审计', value: 'community/Audit' }]
const { busy, run } = useOperation()
const tableData = ref<SysMenu[]>([]), dialogVisible = ref(false)
const emptyMenu = (): Partial<SysMenu> => ({ parentId: 0, name: '', perms: '', icon: '', path: '', component: '', type: 0, statu: 1, orderNum: 1 })
const editForm = ref(emptyMenu()), formRef = ref<FormInstance>()
function parents(rows: SysMenu[]): SysMenu[] {
  return rows.filter(row => row.type !== 2 && row.id !== editForm.value.id).map(row => ({ ...row, children: parents(row.children || []) }))
}
const parentOptions = computed(() => [{ id: 0, name: '顶级目录', children: parents(tableData.value) }])
const editFormRules: FormRules = {
  name: [{ required: true, max: 64, message: '请输入菜单名称（最多 64 个字符）', trigger: 'blur' }],
  perms: [{ required: true, max: 255, message: '请输入权限编码', trigger: 'blur' }],
  parentId: [{ required: true, message: '请选择父级' }], type: [{ required: true, message: '请选择类型' }],
  statu: [{ required: true, message: '请选择状态' }], orderNum: [{ required: true, message: '请输入排序号' }]
}
async function loadMenus() { tableData.value = (await request.get<ApiResult<SysMenu[]>>('/sys/menu/list')).data.data }
function openCreate() { editForm.value = emptyMenu(); dialogVisible.value = true; nextTick(() => formRef.value?.clearValidate()) }
function resetForm(_name?: string) { dialogVisible.value = false; editForm.value = emptyMenu(); formRef.value?.clearValidate() }
function handleClose() { resetForm() }
async function submitForm(_name: string) {
  if (!await formRef.value?.validate().catch(() => false)) return
  await run(async () => {
    await request.post('/sys/menu/' + (editForm.value.id ? 'update' : 'save'), editForm.value)
    ElMessage.success('菜单已保存，重新登录后刷新导航'); resetForm(); await loadMenus()
  })
}
function editHandle(id: number) { return run(async () => {
  editForm.value = (await request.get<ApiResult<SysMenu>>('/sys/menu/info/' + id)).data.data
  dialogVisible.value = true; await nextTick(); formRef.value?.clearValidate()
}) }
function delHandle(id: number) { return run(async () => {
  await request.post('/sys/menu/delete/' + id); ElMessage.success('菜单已删除'); await loadMenus()
}) }
onMounted(() => run(loadMenus))
</script>
