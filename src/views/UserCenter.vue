    <template>
	<div style="text-align: center;">
		<h2>{{ userInfo.username }} · 修改密码</h2>

		<el-form :model="passForm" status-icon :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="旧密码" prop="currentPass">
				<el-input type="password" v-model="passForm.currentPass" autocomplete="off"></el-input>
			</el-form-item>
			<el-form-item label="新密码" prop="password">
				<el-input type="password" v-model="passForm.password" autocomplete="off"></el-input>
			</el-form-item>
			<el-form-item label="确认密码" prop="checkPass">
				<el-input type="password" v-model="passForm.checkPass" autocomplete="off"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="submitForm('passForm')">提交</el-button>
				<el-button @click="resetForm('passForm')">重置</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import request from '@/axios'
import { clearSession } from '@/session'
const formRef = ref<FormInstance>()
const userInfo = ref({ username: '' })
const passForm = reactive({ currentPass: '', password: '', checkPass: '' })
const rules: FormRules = {
  currentPass: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  password: [{ required: true, min: 8, max: 72, message: '密码至少 8 个字符，最多 72 字节', trigger: 'blur' }],
  checkPass: [{ validator: (_rule, value, callback) => callback(value === passForm.password && value ? undefined : new Error('两次输入密码不一致')), trigger: 'blur' }]
}
onMounted(async () => { try { userInfo.value = (await request.get('/sys/userInfo')).data.data } catch { /* Displayed by request layer. */ } })
async function submitForm(_formName: string) {
  if (!await formRef.value?.validate().catch(() => false)) return
  try { await request.post('/sys/user/updatePass', passForm); ElMessage.success('密码修改成功，请重新登录'); await clearSession() }
  catch { /* Displayed by request layer. */ }
}
function resetForm(_formName: string) { formRef.value?.resetFields() }
</script>

<style scoped>
.el-form {
	width: min(420px, 100%);
	margin: 50px auto;
}
</style>
