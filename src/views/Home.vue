<template>
	<el-container class="admin-layout">
		<el-aside width="200px" class="desktop-navigation">

			<SideMenu></SideMenu>

		</el-aside>
		<el-container class="workspace">
			<el-header>
				<el-button class="mobile-navigation-button" aria-label="打开管理导航" :aria-expanded="mobileMenuOpen" @click="mobileMenuOpen=true"><el-icon><Menu /></el-icon></el-button>
				<strong>流沙社区管理后台</strong>

				<div class="header-avatar">

					<el-avatar size="default" :src="userInfo.avatar"></el-avatar>

					<el-dropdown>
						<button type="button" class="el-dropdown-link" aria-label="账号菜单">
						{{userInfo.username}}<el-icon><ArrowDown /></el-icon>
						</button>
						<template #dropdown><el-dropdown-menu>
							<el-dropdown-item>
								<router-link :to="{name: 'UserCenter'}">个人中心</router-link>
							</el-dropdown-item>
							<el-dropdown-item @click="logout">退出</el-dropdown-item>
						</el-dropdown-menu></template>
					</el-dropdown>


				</div>

			</el-header>
			<el-main id="main-content" tabindex="-1">
				<Tabs></Tabs>
				<div class="page-content">
					<router-view/>
				</div>
			</el-main>
		</el-container>
		<el-drawer v-model="mobileMenuOpen" title="管理导航" direction="ltr" :size="240" class="mobile-navigation">
			<SideMenu @navigate="mobileMenuOpen=false" />
		</el-drawer>
	</el-container>
</template>

<script lang="ts">
import { ArrowDown, Menu } from '@element-plus/icons-vue'
import { defineComponent } from 'vue'
	import SideMenu from "./inc/SideMenu.vue";
	import Tabs from "./inc/Tabs.vue";
import { clearSession } from "@/session";

	export default defineComponent({
		name: "Home",
		components: {
			SideMenu, Tabs, ArrowDown, Menu
		},
		data() {
			return {
				mobileMenuOpen: false,
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
		margin-left: auto;
		display: flex;
		gap: 18px;
		align-items: center;
	}

	.el-dropdown-link {
		cursor: pointer;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		padding: 8px 4px;
	}

	.el-header {
		background-color: #17B3A3;
		color: #333;
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.el-aside {
		background-color: #D3DCE6;
		color: #333;
		overflow-y: auto;
	}

	.el-main {
		color: #333;
		padding: 0;
		min-width: 0;
	}
	.workspace { min-width: 0; }
	.page-content { margin: 0 15px 24px; }
	.mobile-navigation-button { display: none; }
	:deep(.el-pagination) { flex-wrap: wrap; gap: 8px; }
	:deep(.el-dropdown-link) { display: inline-flex; align-items: center; max-width: 180px; overflow: hidden; }
	@media (max-width: 760px) {
		.desktop-navigation { display: none; }
		.mobile-navigation-button { display: inline-flex; padding: 8px; }
		.el-header { gap: 10px; padding: 0 12px; }
		.el-header strong { font-size: 14px; white-space: nowrap; }
		.header-avatar { gap: 0; }
		.header-avatar :deep(.el-avatar) { display: none; }
		:deep(.el-dropdown-link) { max-width: 100px; }
		.page-content { margin: 0 12px 20px; }
		:deep(.el-form--inline .el-form-item) { margin-right: 12px; max-width: 100%; }
		:deep(.el-pagination) { justify-content: flex-start; }
	}

	a {
		text-decoration: none;
	}
</style>
