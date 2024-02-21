<script>
import { useRouter } from 'vue-router';
export default {
  name: 'Welcome',
  setup(){
    const router = useRouter();
    function goLogin() {
      router.push('/login');
    }
    return  { goLogin }
  }
} 
</script>

<template>
  <h2>这里是欢迎页面</h2>
  <el-button @click="goLogin">去登陆</el-button>
</template>

<style scoped></style>
