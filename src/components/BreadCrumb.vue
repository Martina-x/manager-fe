<template>
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item v-for="(item, index) in breadList" :key="item.path">
      <router-link v-if="index == 0" to="/">{{ item.meta.title }}</router-link>
      <span v-else>{{ item.meta.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
import { ArrowRight } from '@element-plus/icons-vue'
import { computed } from 'vue';
import { useRoute } from "vue-router";
export default {
  name: 'BreadCrumb',
  setup() {
    const route = useRoute();
    const breadList = computed(() => {
      return route.matched;
    });
    return { ArrowRight, breadList }
  }
}
</script>
