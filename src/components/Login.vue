<script>
export default {
  name: 'Login',
  mounted(){
    // 调用request的第一种写法
    /* this.$request({
      method: 'get',
      url: '/login',
      data: {
        name: 'sataa'
      }
    }).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    }) */

    // 调用request的第二种写法
    this.$request.get('/login', {name: 'sataa'}, {mock: true, loading: true}).then(res => {
      console.log(res);
    })
  }
}
</script>

<template>
  <h2>这里是登陆页面</h2>
  <router-link to="/welcome">返回欢迎页</router-link>
</template>

<style scoped></style>
