<template>
  <div class="exception">
    <img src="@/assets/images/404.jpg" alt="404">
    <el-button @click="goHome" class="btn-home">回首页</el-button>
  </div>
</template>
          
<script>
export default {
  name: '404',
  methods: {
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style  scoped lang="scss">
.exception {
  position: relative;
  img {
    width: 100%;
    height: 100vh;
  }
  .btn-home {
    position: fixed;
    left: 50%;
    margin-left: -24px;
    bottom: 50px;
  }
}
</style>
          