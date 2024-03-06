<template>
  <template v-for="menu in userMenu">
    <el-sub-menu v-if="menu.children && menu.children.length > 0 && menu.children[0].menuType == 1" :index="menu.path">
      <template #title>
        <component class="svgIcon" :is="menu.icon"></component>
        <span>{{ menu.menuName }}</span>
      </template>
      <tree-menu :userMenu="menu.children" />
    </el-sub-menu>
    <el-menu-item v-else-if="menu.menuType == 1" :index="menu.path">{{ menu.menuName }}</el-menu-item>
  </template>
</template>
          
<script>
export default {
  name: 'TreeMenu',
  props: {
    userMenu: {
      type: Array,
      default: []
    }
  }
}
</script>

<style scoped>
.svgIcon {
  width: 1.5em;
  height: 1.5em;
  margin-right: 5px;
}
</style>
          