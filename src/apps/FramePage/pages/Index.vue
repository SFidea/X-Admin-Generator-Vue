/**
* Created by OXOYO on 2017/12/5.
*
* FramePage 应用根组件
*/

<style scoped lang="less" rel="stylesheet/less">
  .app-window-iframe {
    width: 100%;
    height: 100%;
    /*background: #ffffff;*/

    .loading {
      display: inline-block;
      margin-top: 10px;

      .loading-icon{
        animation: loading-spin 1s linear infinite;
      }
      @keyframes loading-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
      }
    }

    .load-complete {
      display: inline-block;
      width: 100%;
      text-align: center;
      height: 30px;
      line-height: 30px;
      font-size: 20px;
      margin: 20px 0;

      &.load-success {
        color: #19be6b;
      }
      &.load-fail {
        color: #ed3f14;
      }
      .load-text {
        display: inline-block;
      }
      .load-text-strong {
        color: #000000;
      }
    }
    .iframe-box {
      margin: 0 auto;
      width: 100%;
      height: 100%;
    }
  }
</style>

<template>
  <div class="main-box">
    <div class="app-window-iframe">
      <div class="loading" v-show="loadStatus === 'loading'">
        <Spin fix>
          <Icon class="loading-icon" type="load-c" size=18></Icon>
          <div class="loading-text">加载中...</div>
        </Spin>
      </div>
      <div
        v-show="loadStatus === 'fail'"
        :class="{ 'load-complete': true, 'load-fail': loadStatus === 'fail' }"
      >
        <Icon type="close-circled"></Icon>
        <div class="load-text">加载应用程序</div>
        <div class="load-text load-text-strong">{{ info.title }}</div>
        <div class="load-text">失败！</div>
      </div>
      <iframe
        v-show="loadStatus === 'success'"
        class="iframe-box"
        name="iframe-box"
        :src="appPath"
        :width="appWidth"
        :height="appHeight"
        frameborder="0"
        marginwidth="0"
        marginheight="0"
        @load="handlerLoad"
      >
      </iframe>
    </div>
  </div>
</template>

<script>
  import Store from '../store'

  export default {
    name: 'FramePage',
    data () {
      return {
        info: {},
        appPath: null,
        appWidth: 0,
        appHeight: 0,
        // 加载状态 loading：加载中 fail：加载失败 success：加载成功
        loadStatus: ''
      }
    },
    methods: {
      // 初始化
      init () {
        let _t = this
        // 加载应用
        _t.loadApp()
      },
      // 加载应用
      loadApp () {
        let _t = this
        _t.loadStatus = 'loading'
        _t.appWidth = _t.$el ? parseInt(_t.$el.offsetWidth) : '100%'
        _t.appHeight = _t.$el ? parseInt(_t.$el.offsetHeight) : '100%'
        _t.appPath = _t.info.url
        document.body.onbeforeunload = function (event) {
          if (!window.event) {
            event.returnValue = false
          } else {
            window.event.returnValue = false
          }
        }
      },
      handlerLoad () {
        let _t = this
        _t.loadStatus = _t.appPath ? 'success' : 'fail'
      }
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        vm.info = to.params.info || {}
        if (Object.keys(vm.info).length && vm.info.name && vm.info.url) {
          vm.$Cookies.set(vm.info.name, vm.info.url)
        } else {
          if (to.params.name) {
            vm.info = {
              name: to.params.name,
              url: vm.$Cookies.get(to.params.name)
            }
          }
        }
        // 初始化窗口
        vm.init()
      })
    },
    beforeRouteUpdate (to, from, next) {
      let _t = this
      _t.info = to.params.info || {}
      // 初始化窗口
      _t.init()
      next()
    },
    created () {
      let _t = this
      // 将store注册到apps下
      _t.$store.registerModule(['Apps', Store.moduleName], Store.store)
    },
    beforeDestroy () {
      document.body.onbeforeunload = null
    },
    destroyed () {
      let _t = this
      // 卸载store
      _t.$store.unregisterModule(['Apps', Store.moduleName])
    }
  }
</script>
