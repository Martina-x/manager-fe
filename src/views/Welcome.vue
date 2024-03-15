<template>
  <div class="welcome">
    <div class="content">
      <div class="sub-title">欢迎体验</div>
      <div class="title">慕课通用后台管理系统</div>
      <div class="desc">- Vue3.0+ElementPlus+Node+Mongo打造通用后台管理系统</div>
    </div>
    <div class="img"></div>
  </div>
</template>

<script>
</script>

<style scoped lang="scss">
.welcome {
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  .content {
    position: relative;
    .sub-title {
      font-size: 30px;
      color: #333;
      line-height: 42px;
    }

    .title {
      font-size: 40px;
      color: #409eff;
      line-height: 62px;
    }

    .desc {
      font-size: 14px;
      color: #999;
      text-align: right;
    }
  }
  .img {
    width: 371px;
    height: 438px;
    background-image: url('@/assets/images/welcome.png');
  }
}
</style>
