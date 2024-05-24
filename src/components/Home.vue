<template>
  <div class="basic-layout">
    <div :class="['nav-side', isCollapse ? 'fold' : 'unfold']">
      <!-- 系统LOGO -->
      <div class="logo">
        <img src="@/assets/logo.png" alt="">
        <span>Manager</span>
      </div>
      <!-- 导航菜单 -->
      <el-menu 
        class="nav-menu" 
        background-color="#001529" 
        text-color="#fff" 
        :collapse="isCollapse" 
        router
        :default-active="activeMenu"
      >
        <tree-menu :userMenu="userMenu" />
      </el-menu>
    </div>
    <div :class="['content-right', isCollapse ? 'fold' : 'unfold']">
      <div class="nav-top">
        <div class="nav-left">
          <div class="menu-fold" @click="toggle">
            <el-icon>
              <Fold />
            </el-icon>
          </div>
          <div class="bread">
            <BreadCrumb />
          </div>
        </div>

        <div class="user-info">
          <el-badge class="notice" :is-dot="noticeCount > 0 ? true : false" type="danger">
            <el-icon>
              <Bell />
            </el-icon>
          </el-badge>
          <el-dropdown @command="handleLogout">
            <span class="user-link">
              {{ userInfo.userName}}
              <i class="el-icon--right"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="email">邮箱：{{ userInfo.userEmail }}</el-dropdown-item>
                <el-dropdown-item command="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="wrapper">
        <div class="main-page">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TreeMenu from "@/components/TreeMenu.vue";
import BreadCrumb from "@/components/BreadCrumb.vue";
export default {
  name: 'Home',
  components: { TreeMenu, BreadCrumb },
  data() {
    return {
      isCollapse: false,
      userInfo: this.$store.state.userInfo,
      noticeCount: 0,
      userMenu: [],
      activeMenu: location.hash.slice(1)
    }
  },
  mounted() {
    this.getNoticeCount();
    this.getMenuList();
  },
  methods: {
    toggle() {
      this.isCollapse = !this.isCollapse;
    },
    handleLogout(key) {
      if (key === 'email') return;
      this.$store.commit("saveUserInfo", "");
      this.userInfo = {};
      this.$router.push("/login");
    },
    async getNoticeCount() {
      try {
        const count = await this.$api.noticeCount();
        this.noticeCount = count;
      } catch (error) {
        console.error(error); 
      }
      
    },
    async getMenuList() {
      try {
        const { menuList, actionList } = await this.$api.getPermissionList();
        this.userMenu = menuList;
        this.$store.commit("saveUserMenu", menuList);
        this.$store.commit("saveUserAction", actionList);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
</script>

<style lang="scss">
.basic-layout {
  position: relative; //

  .nav-side {
    position: fixed; //
    width: 200px;
    height: 100vh;
    background-color: #001529;
    color: #fff;
    overflow-y: auto;
    transition: width .5s; // 菜单宽度变化过渡效果

    .nav-menu {
      height: calc(100vh - 70px); // 如果刚好为50px，在折叠的时候设置的高度超出（因为横向滚动条占据了一定的高度），所以要将菜单高度减小，以防超出
      border-right: none; //
    }

    // 合并
    &.fold {
      width: 64px;
    }

    // 展开
    &.unfold {
      width: 200px;
    }

    .logo {
      display: flex;
      align-items: center;
      font-size: 18px;
      height: 50px; //

      img {
        width: 32px;
        height: 32px;
        margin: 0 16px;
      }


    }


  }

  .content-right {
    margin-left: 200px;

    // 合并
    &.fold {
      margin-left: 64px;
    }

    // 展开
    &.unfold {
      margin-left: 200px;
    }

    .nav-top {
      height: 50px;
      line-height: 50px;
      border-bottom: solid #ddd 1px;
      display: flex;
      justify-content: space-between;
      padding: 0 20px;

      .nav-left {
        display: flex;
        align-items: center;

        .menu-fold {
          display: flex;
          align-items: center; // 使icon图标垂直居中
          margin-right: 15px;
          font-size: 18px;

          &:hover {
            cursor: pointer;
          }
        }
      }

      .user-info {
        display: flex;
        align-items: center;

        .notice {
          line-height: 30px;
          margin-right: 15px;
          margin-top: 5px;
        }

        .user-link {
          cursor: pointer;
          color: #409eff;
        }
      }
    }

    .wrapper {
      background: #eef0f3;
      padding: 20px;
      height: calc(100vh - 50px);

      .main-page {
        height: 100%;
      }
    }
  }

}
</style>
