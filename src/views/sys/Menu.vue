<template>
	<div>

		<el-form :inline="true">
			<el-form-item>
				<el-button type="primary" @click="dialogVisible = true">新增</el-button>
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
					<el-button link type="primary" @click="editHandle(scope.row.id)">编辑</el-button>
					<el-divider direction="vertical"></el-divider>


						<el-popconfirm title="这是一段内容确定删除吗？" @confirm="delHandle(scope.row.id)">
							<template #reference><el-button link type="primary">删除</el-button></template>
						</el-popconfirm>


				</template>
			</el-table-column>

		</el-table>


		<!--新增对话框-->
		<el-dialog
				title="提示"
				v-model="dialogVisible"
				width="600px"
				:before-close="handleClose">

			<el-form :model="editForm" :rules="editFormRules" ref="editForm" label-width="100px" class="demo-editForm">

				<el-form-item label="上级菜单" prop="parentId">
					<el-select v-model="editForm.parentId" placeholder="请选择上级菜单">
						<template v-for="item in tableData" :key="item.id">
							<el-option :label="item.name" :value="item.id"></el-option>
							<template v-for="child in item.children" :key="child.id">
								<el-option :label="child.name" :value="child.id">
									<span>{{ "- " + child.name }}</span>
								</el-option>
							</template>
						</template>
					</el-select>
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
				<el-form-item label="菜单URL" prop="path" label-width="100px">
					<el-input v-model="editForm.path" autocomplete="off"></el-input>
				</el-form-item>

				<el-form-item label="菜单组件" prop="component" label-width="100px">
					<el-input v-model="editForm.component" autocomplete="off"></el-input>
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
					<el-button type="primary" @click="submitForm('editForm')">立即创建</el-button>
					<el-button @click="resetForm('editForm')">重置</el-button>
				</el-form-item>
			</el-form>

		</el-dialog>


	</div>

</template>

<script lang="ts">
import type { SysMenu, SysRole, SysUser } from '@/types'
import type { TableInstance, TreeInstance } from 'element-plus'
import { defineComponent } from 'vue'
import type { FormInstance } from 'element-plus'
	export default defineComponent({
		name: "Menu",
		data() {
			return {
				dialogVisible: false,
				editForm: {} as Partial<SysMenu>,
				editFormRules: {
					parentId: [
						{required: true, message: '请选择上级菜单', trigger: 'blur'}
					],
					name: [
						{required: true, message: '请输入名称', trigger: 'blur'}
					],
					perms: [
						{required: true, message: '请输入权限编码', trigger: 'blur'}
					],
					type: [
						{required: true, message: '请选择状态', trigger: 'blur'}
					],
					orderNum: [
						{required: true, message: '请填入排序号', trigger: 'blur'}
					],
					statu: [
						{required: true, message: '请选择状态', trigger: 'blur'}
					]
				},
				tableData: [] as SysMenu[]
			}
		},
		created() {
			this.getMenuTree()
		},
		methods: {
			getMenuTree() {
				this.$axios.get("/sys/menu/list").then(res => {
					this.tableData = res.data.data
				})
			},
			submitForm(formName: string) {
				;(this.$refs[formName] as FormInstance).validate((valid) => {
					if (valid) {
						this.$axios.post('/sys/menu/' + (this.editForm.id?'update' : 'save'), this.editForm)
							.then(res => {

								this.$message({
									showClose: true,
									message: '恭喜你，操作成功',
									type: 'success',
									onClose:() => {
										this.getMenuTree()
									}
								});

								this.dialogVisible = false
						})
					} else {
						console.log('error submit!!');
						return;
					}
				});
			},
			editHandle(id: number) {
				this.$axios.get('/sys/menu/info/' + id).then(res => {
					this.editForm = res.data.data

					this.dialogVisible = true
				})
			},
			resetForm(formName: string) {
				;(this.$refs[formName] as FormInstance).resetFields();
				this.dialogVisible = false
				this.editForm = {}
			},
			handleClose() {
				this.resetForm('editForm')
			},
			delHandle(id?: number) {
				this.$axios.post("/sys/menu/delete/" + id).then(res => {
					this.$message({
						showClose: true,
						message: '恭喜你，操作成功',
						type: 'success',
						onClose:() => {
							this.getMenuTree()
						}
					});

				})
			}
		}
	})
</script>

<style scoped>

</style>
