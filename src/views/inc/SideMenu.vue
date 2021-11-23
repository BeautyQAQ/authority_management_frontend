<template>
    <el-menu
            class="el-menu-vertical-demo"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
    >
        <router-link to="/index">
            <el-menu-item index="Index">
                <template slot="title">
                    <i class="el-icon-s-home"></i>
                    <span slot="title">首页</span>
                </template>
            </el-menu-item>
        </router-link>
        <el-submenu index="1">
            <template slot="title">
                <i class="el-icon-s-operation"></i>
                <span>系统管理</span>
            </template>
            <el-menu-item index="1-1">
                <template slot="title">
                    <i class="el-icon-s-custom"></i>
                    <span slot="title">用户管理</span>
                </template>
            </el-menu-item>
            <el-menu-item index="1-2">
                <template slot="title">
                    <i class="el-icon-rank"></i>
                    <span slot="title">角色管理</span>
                </template>
            </el-menu-item>
            <el-menu-item index="1-3">
                <template slot="title">
                    <i class="el-icon-menu"></i>
                    <span slot="title">菜单管理</span>
                </template>
            </el-menu-item>
        </el-submenu>
        <el-submenu index="2">
            <template slot="title">
                <i class="el-icon-s-tools"></i>
                <span>系统工具</span>
            </template>
            <el-menu-item index="2-2">
                <template slot="title">
                    <i class="el-icon-s-order"></i>
                    <span slot="title">数字字典</span>
                </template>
            </el-menu-item>
        </el-submenu>
    </el-menu>
</template>
<script>
    export default {
        name: "SideMenu",
        data() {
            
        }
    }
</script>
<style scoped>
    .el-menu-vertical-demo {
        height: 100%;
    }
    a{
        text-decoration:none;
    }
</style>
