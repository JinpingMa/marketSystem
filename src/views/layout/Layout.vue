<template>
  <div class="app-wrapper" :class="{hideSidebar:!sidebar.opened}">
    <sidebar class="sidebar-container"></sidebar>
    <div class="main-container">
      <navbar></navbar>
      <app-main></app-main>
      <img class="gmk-logo" src="../../assets/xgc.png" alt="" title="Welcome">
    </div>
  </div>
</template>

<script>
  import { Navbar, Sidebar, AppMain } from '@/views/layout/components'
  // import { getRefreshState } from '../../utils/auth'

  export default {
    name: 'layout',
    components: {
      Navbar,
      Sidebar,
      AppMain
    },
    computed: {
      sidebar () {
        return this.$store.state.app.sidebar
      }
    },
    mounted () {
      this.$store.commit('getRouter', this.$router)
      // if (getRefreshState() === 'true') {
      // this.$store.dispatch('REFRESH_BLOOMBERG', { 'router': this.$router })
      // }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "../../styles/mixin";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
  }

  .gmk-logo {
    position: absolute;
    top: 95vh;
    right: 20px;

    &:hover {
      transform: rotateZ(360deg);
      transition: all 0.4s ease-in;
    }
  }
</style>
