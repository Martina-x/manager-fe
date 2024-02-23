<template>
  <router-view></router-view>
</template>

<script>
  export default {
    name: 'app',
    mounted(){
      this.$storage.setItem("name", "amy");
      this.$storage.setItem("age", 30);
      this.$storage.setItem("age", 50);
      console.log(this.$storage.getItem("name"));
      this.$storage.setItem("name", "lucy");
      console.log(this.$storage.getItem("name"));
      this.$storage.clearItem("name")
      this.$storage.setItem("userinfo", { name: "lili" })
      // this.$storage.clearAll();
    }
  }
</script>

<style scoped>

</style>
