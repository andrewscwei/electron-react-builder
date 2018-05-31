<template>
  <div id='app'>
    <div id='background'></div>
    <Admin/>
    <transition name='page-transition'>
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
  import Admin from 'electron-react-builder/app/renderer/Admin.vue'

  export default {
    components: { Admin }
  }
</script>

<style lang='scss'>
  // THESE ARE ALL AUTO GENERATED AND ARE MEANT TO BE REPLACED.
  @import '@/assets/styles/global.scss';
  @import url('https://fonts.googleapis.com/css?family=Roboto');

  html, body, #app {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-text-stroke: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    padding: 0;
    font-family: 'Roboto';
    font-weight: 300;
    text-transform: uppercase;
  }

  a, li, p {
    font-family: 'Roboto';
    font-weight: 300;
    list-style: none;
    margin: 0;
    padding: 0;
    text-decoration: none;
  }

  ol, ul {
    margin: 0;
    padding: 0;
  }

  span {
    font-family: inherit;
    font-weight: inherit;
    text-decoration: inherit;
  }

  a, button {
    outline: none;
    border: none;
    background: transparent;
  }

  em {
    color: #e22d2d;
    font-style: normal;
    text-decoration: none;
  }

  #app {
    background: #111;
  }

  #background {
    width: 100%;
    height: 100%;
    background: url('~assets/images/background.jpeg') center/cover no-repeat;
    opacity: .08;
    position: absolute;
  }

  .page-transition-enter-active,
  .page-transition-leave-active {
    transition: all .4s;
  }

  .page-transition-enter,
  .page-transition-leave-to {
    opacity: 0;
    transform: scale(.9);
  }
</style>
