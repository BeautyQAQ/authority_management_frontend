<template>
	<el-container>
		<el-aside width="200px">

			<SideMenu></SideMenu>

		</el-aside>
		<el-container>
			<el-header>
				<strong>流沙社区管理后台</strong>

				<div class="header-avatar">

					<el-avatar size="default" :src="userInfo.avatar"></el-avatar>

					<el-dropdown>
						<span class="el-dropdown-link">
						{{userInfo.username}}<el-icon><ArrowDown /></el-icon>
						</span>
						<template #dropdown><el-dropdown-menu>
							<el-dropdown-item>
								<router-link :to="{name: 'UserCenter'}">个人中心</router-link>
							</el-dropdown-item>
							<el-dropdown-item @click="logout">退出</el-dropdown-item>
						</el-dropdown-menu></template>
					</el-dropdown>


				</div>

			</el-header>
			<el-main>
				<Tabs></Tabs>
				<div style="margin: 0 15px;">
					<router-view/>
				</div>
			</el-main>
		</el-container>
	</el-container>
</template>

<script lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import { defineComponent } from 'vue'
	import SideMenu from "./inc/SideMenu.vue";
	import Tabs from "./inc/Tabs.vue";
import { clearSession } from "@/session";

	export default defineComponent({
		name: "Home",
		components: {
			SideMenu, Tabs, ArrowDown
		},
		data() {
			return {
				userInfo: {
					id: "",
					username: "",
					avatar: ""
				}
			}
		},
		created() {
			this.getUserInfo()
		},
		methods: {
			getUserInfo() {
				this.$axios.get("/sys/userInfo").then(res => {
					this.userInfo = res.data.data
				}).catch(() => { /* Displayed by the HTTP layer. */ })
			},
            async logout() {
                try { await this.$axios.post('/logout') }
                catch { /* Displayed by the HTTP layer. */ }
                finally { await clearSession() }
            }
		}
	})
</script>

<style scoped>
	.el-container {
		padding: 0;
		margin: 0;
		height: 100%;
	}

	.header-avatar {
		float: right;
		width: 210px;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.el-dropdown-link {
		cursor: pointer;
	}

	.el-header {
		background-color: #17B3A3;
		color: #333;
		text-align: center;
		line-height: 60px;
	}

	.el-aside {
		background-color: #D3DCE6;
		color: #333;
		line-height: 200px;
	}

	.el-main {
		color: #333;
		padding: 0;
	}

	a {
		text-decoration: none;
	}
</style>
