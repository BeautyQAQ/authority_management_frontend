<template>
	<div id="app">
		<router-view/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
	export default defineComponent({
		name: "App",
		watch: {
			$route(to, from) {

				console.log("to")
				console.log(to)

				if (to.path != '/login') {
					let obj = {
						name: to.name,
						title: to.meta.title
					}

					this.$store.commit("addTab", obj)
				}

			}
		}
	})
</script>

<style>
	html, body, #app {
		font-family: 'Helvetica Neue', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'Microsoft Yahei', sans-serif;
		height: 100%;
		padding: 0;
		margin: 0;
		font-size: 15px;
	}
</style>
