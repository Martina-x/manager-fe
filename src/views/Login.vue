<template>
  <div class="login-wrapper">
    <div class="modal">
      <el-form ref="userForm" :model="user" :rules="rules" status-icon>
        <div class="title">Sign in</div>
        <el-form-item prop="userName">
          <el-input type="text" prefix-icon="User" v-model="user.userName" />
        </el-form-item>
        <el-form-item prop="userPwd">
          <el-input type="password" prefix-icon="View" v-model="user.userPwd" />
        </el-form-item>
        <el-form-item>
          <el-button class="btn-login" type="primary" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';

export default {
  name: 'Login',
  data() {
    return {
      user: {
        userName: '',
        userPwd: ''
      },
      rules: {
        userName: {required: true, message:'请输入用户名', trigger: 'blur'},
        userPwd: { required: true, message: '请输入密码', trigger: 'blur' }
      }
    }
  },
  methods: {
    login() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          this.$api.login(this.user).then(res => {
            ElMessage.success("登录成功");
            this.$store.commit("saveUserInfo", res);
            this.$router.push('/welcome');
          })
        } else {
          ElMessage.warning("用户名或密码不正确");
          return false
        }
      })
      
    }
  }
}
</script>

<style lang="scss">
.login-wrapper {
  width: 100vw;
  height: 100vh;
  background-color: #f9fcff;
  display: flex;
  justify-content: center;
  align-items: center;
  .modal {
    width: 500px;
    padding: 50px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0px 0px 10px 5px #c7c9cb4d;
    .title {
      font-size: 25px;
      text-align: center;
      margin-bottom: 30px;
      line-height: 2.5;
    }
    .btn-login {
      width: 100%;
    }
  }
}
</style>
