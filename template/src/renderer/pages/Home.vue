<template>
  <!-- THESE ARE ALL AUTO GENERATED AND ARE MEANT TO BE REPLACED. -->
  <main>
    <Logo id='logo'/>
    <h1 class='title'>\{{ $t('hello', { num: count, num2: doubleCount }) }}</h1>
    <p v-html='$t("description")'></p>
    <nav>
      <router-link type='button' :to='$locale.current() === "en" ? "/jp" : "/"'>\{{ $t('switch-lang') }}</router-link>
      <button type='button' @click='increment()'>\{{ $t('increment') }}</button>
      <button type='button' @click='incrementTwice()'>\{{ $t('increment-twice') }}</button>
    </nav>
  </main>
</template>

<script>
  // THESE ARE ALL AUTO GENERATED AND ARE MEANT TO BE REPLACED.
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
  import Logo from '@/components/Logo.vue'

  export default {
    components: { Logo },

    computed: {
      ...mapState(`common`, {
        count: state => state.count
      }),
      ...mapGetters(`common`, [
        `doubleCount`
      ])
    },

    methods: {
      ...mapMutations(`common`, [
        `increment`
      ]),
      ...mapActions(`common`, [
        `incrementTwice`
      ])
    }
  }
</script>

<style scoped lang='scss'>
  // THESE ARE ALL AUTO GENERATED AND ARE MEANT TO BE REPLACED.
  main {
    width: 100%;
    height: 100%;
    padding: 30px;
    position: absolute;
    justify-content: center;
    align-content: center;
    align-items: center;
    flex-flow: column nowrap;
    flex: 0 1 auto;
    display: flex;
    box-sizing: border-box;
  }

  #logo {
    margin-bottom: 3em;
  }

  h1 {
    padding: 0 0 5px 0;
    margin: 0;
    color: #fff;
    font-size: 4em;
    text-align: center;
  }

  p {
    color: #aaa;
    font-size: 1em;
    text-align: center;
  }

  [type='button'] {
    width: 120px;
    height: 40px;
    background: #fff;
    color: #111;
    font-weight: 400;
    text-transform: uppercase;
    text-decoration: none;
    box-sizing: border-box;
    justify-content: center;
    align-content: center;
    align-items: center;
    flex-flow: column nowrap;
    display: flex;
    outline: none;
    border: none;

    &:not(:last-child) {
      margin-right: 10px;
    }
  }

  nav {
    margin-top: 30px;
    display: flex;
  }
</style>
