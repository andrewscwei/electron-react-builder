<!--
  @file Admin panel component. Once added, you can toggle this panel by clicking
        on the top left corner of the screen 5x consecutively within 500ms
        intervals. This component handles the following for you:
          1. Toggling on-screen debugging
          2. Check/install app updates manually or automatically whenever the
             app goes idle (override the default timeout in $config.idleTimeout)
          3. Other useful debugging features such as refreshing the app and
             quitting the app

        This component expects that the app repo has a `Settings.vue` file in
        `@/components`. The Settings component is automatically loaded into
        this admin panel. Add app-specific options in there if you wish.
-->
<template>
  <div id='admin' :class='{ [$style[`root`]]: true, [$style[`root--active`]]: isActive }'>
    <div :class='[$style[`section`], $style[`status`]]'>
      <span>{{ appStatus }}</span>
    </div>
    <div :class='[$style[`section`], $style[`header`]]'>
      <h2 :class='$style[`subtitle`]'>Admin</h2>
      <h1 :class='$style[`title`]'>{{ appName }}</h1>
      <h4 :class='$style[`version`]'>{{ appVersion }} / {{ ipAddress }}</h4>
    </div>
    <div :class='[$style[`section`], $style[`settings`]]'>
      <Settings/>
    </div>
    <div :class='[$style[`section`], $style[`controls`]]'>
      <button :class='$style[`button`]' @click='refresh()'>Refresh</button>
      <button :class='{ [$style[`button`]]: true, [$style[`button--active`]]: debugEnabled }' @click='toggleDebugMode()'>Debug Mode</button>
      <button :class='$style[`button`]' @click='checkForUpdates()'>Check for Updates</button>
      <button :class='$style[`button`]' @click='installUpdates()' :disabled='!updateReady'>Install updates</button>
      <button :class='$style[`button`]' @click='deactivate()'>Close Panel</button>
      <button :class='[$style[`button`], $style[`button--quit`]]' @click='quitApp()'>Quit App</button>
    </div>
  </div>
</template>

<script>
  import Settings from '@/Settings'
  import { ipcRenderer, remote } from 'electron'
  import ip from 'ip'

  // Timeout in between click intervals when activating the admin panel, in ms.
  const ACTIVATION_TIMEOUT_INTERVAL = 500

  // Number of times to click on the top left corner of the screen to activate
  // the admin panel.
  const MAX_ACTIVATION_COUNT = 5

  // Updater status enums.
  const UPDATE_STATUS = {
    IDLE: 0,
    CHECKING: 1,
    AVAILABLE: 2,
    NOT_AVAILABLE: 3,
    DOWNLOADING: 4,
    DOWNLOADED: 5,
    ERROR: 6
  }

  // Instance of the Electron browser window.
  const currentWindow = remote.getCurrentWindow()

  export default {
    components: { Settings },

    data() {
      return {
        activationTimeout: null,
        idleTimeout: null,
        isActive: false,
        appStatus: `WARNING: For devs only`,
        updateReady: false,
        activationCount: 0,
        debugEnabled: false
      }
    },

    computed: {
      appName: function() {
        return remote.app.getName()
      },
      appVersion: function() {
        return `v${remote.app.getVersion()}`
      },
      ipAddress: function() {
        return ip.address()
      }
    },

    mounted() {
      ipcRenderer.on('update-status', this.onUpdateStatusChange)
      ipcRenderer.on('debug-enabled', this.onDebugEnabled)

      document.addEventListener('pointerup', this.onPointerUp)
      document.addEventListener('keyup', this.onKeyUp)

      this.restartIdleTimeout()
    },

    destroyed() {
      ipcRenderer.removeListener('update-status', this.onUpdateStatusChange)
      ipcRenderer.removeListener('debug-enabled', this.onDebugEnabled)

      document.removeEventListener('pointerup', this.onPointerUp)
      document.removeEventListener('keyup', this.onKeyUp)

      clearTimeout(this.idleTimeout)
      clearTimeout(this.activationTimeout)
    },

    methods: {
      /**
       * Method invoked when the window detects a pointer up event. When this
       * happens, restart the timeout event. Also, if the pointer is within
       * 100px of the top left corner, initiate the activation process. When
       * the number of occurance hits MAX_ACTIVATION_COUNT, bring out the admin
       * panel.
       * @param {Event} event
       */
      onPointerUp(event) {
        this.restartIdleTimeout()

        if (event.clientX > 100 || event.clientY > 100) return this.cancelActivation()
        this.activationCount++
        this.waitForActivation()

        if (this.activationCount >= MAX_ACTIVATION_COUNT) {
          this.activate()
        }
      },

      /**
       * Method invoked when the window detects a key up event. When this
       * happens, restart the idle timeout.
       * @param {Event} event
       */
      onKeyUp(event) {
        this.restartIdleTimeout()
      },

      /**
       * Method invoked when the update status changes. This is triggered from
       * the main process.
       * @param {Event} event
       * @param {Object} data
       */
      onUpdateStatusChange(event, data) {
        switch (data.status) {
        case UPDATE_STATUS.AVAILABLE:
          this.appStatus = `Update is available`
          break
        case UPDATE_STATUS.NOT_AVAILABLE:
          this.appStatus = `App is up-to-date`
          break
        case UPDATE_STATUS.CHECKING:
          this.appStatus = `Checking for update...`
          break
        case UPDATE_STATUS.ERROR: {
          this.appStatus = `${data.error}`
          // eslint-disable-next-line no-console
          console.error(data.error)
          break
        }
        case UPDATE_STATUS.DOWNLOADING: {
          const toMB = (b) => ((b/(1024*1024)).toFixed(2))
          const progress = data.progress ? `(${Math.floor(data.progress.percent)}% of ${toMB(data.progress.total)}MB at ${toMB(data.progress.bytesPerSecond)}MB/s)` : ``
          this.updateReady = false;
          this.appStatus = `Downloading...${progress}`
          // eslint-disable-next-line no-console
          console.log(`Downloading...${progress}`)
          break
        }
        case UPDATE_STATUS.DOWNLOADED:
          this.updateReady = true
          this.appStatus = `Update is ready to be installed`
          break
        }
      },
      /**
       * Method invoked when on-screen debugging is toggled, triggered from the
       * main process.
       * @param {Event} event
       * @param {boolean} isEnabled
       */
      onDebugEnabled(event, isEnabled) {
        this.debugEnabled = isEnabled
      },

      /**
       * Initiates the activation process. Begin counting the number of clicks
       * and ensure that consecutive clicks are within the specified time
       * interval.
       */
      waitForActivation() {
        clearTimeout(this.activationTimeout)
        this.activationTimeout = setTimeout(this.cancelActivation, ACTIVATION_TIMEOUT_INTERVAL)
      },

      /**
       * Cancels the activation process altogether, resets the click count to 0.
       */
      cancelActivation() {
        clearTimeout(this.activationTimeout)
        this.activationTimeout = null
        this.activationCount = 0
      },

      /**
       * Restarts the idle timeout.
       */
      restartIdleTimeout() {
        if (process.env.NODE_ENV !== 'production') return
        clearTimeout(this.idleTimeout)
        this.idleTimeout = setTimeout(() => {
          ipcRenderer.send('idle')
          clearTimeout(this.idleTimeout)
          this.idleTimeout = null
        }, $config.idleTimeout)
      },

      /**
       * Activates the admin panel.
       */
      activate() {
        this.isActive = true
        this.cancelActivation()
      },

      /**
       * Deactivates the admin panel.
       */
      deactivate() {
        this.isActive = false
      },

      /**
       * Notifies the main process to toggle on-screen debugging.
       */
      toggleDebugMode() {
        ipcRenderer.send('toggle-debug-mode')
      },

      /**
       * Refreshes the Electron window.
       */
      refresh() {
        currentWindow.reload()
      },

      /**
       * Notifies the main process to check for updates.
       */
      checkForUpdates() {
        ipcRenderer.send('check-for-updates')
      },

      /**
       * Notifies the main process to install updates and restart.
       */
      installUpdates() {
        if (this.updateReady) ipcRenderer.send('install-updates')
      },

      /**
       * Quits the app.
       */
      quitApp() {
        remote.app.quit()
      }
    }
  }
</script>

<style module lang='scss'>
  $_admin-width: 400px;

  .root {
    top: 0;
    left: 0;
    width: $_admin-width;
    height: 100vh;
    margin: 0;
    background: #111;
    transition: transform .2s ease-out;
    transform: translate3d(-100%, 0, 0);
    position: fixed;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    color: #fff;
    z-index: 16777271;
    font-family: sans-serif;
    overflow: hidden;
    flex-wrap: nowrap;

    &--active {
      transform: translate3d(0, 0, 0);
    }
  }

  .section {
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .status {
    width: 100%;
    height: 40px;
    background: #7011bf;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    display: flex;
    padding: 0 20px;
    text-align: center;
    word-wrap: none;
    white-space: nowrap;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 1.6px;

    span {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .header {
    padding: 50px 20px 20px;
  }

  .settings {
    width: 100%;
    height: auto;
    flex-grow: 1;
    padding: 20px 20px;
  }

  .controls {
    $_padding: 5px;
    $_cols: 4;
    width: 100%;
    height: auto;
    padding: #{20px - $_padding};
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;

    button {
      margin: #{$_padding/2};
      width: #{($_admin-width - ($_padding * ($_cols + 2) + 20)) / $_cols};
      height: #{($_admin-width - ($_padding * ($_cols + 2) + 20)) / $_cols};
    }
  }

  .title {
    font-family: sans-serif;
    font-size: 24px;
    text-transform: uppercase;
    letter-spacing: .5px;
    text-align: left;
    margin: 0;
  }

  .subtitle {
    font-family: sans-serif;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: #ccc;
    margin: 0;
  }

  .version {
    font-family: sans-serif;
    font-size: 14px;
    letter-spacing: .5px;
    color: #999;
    margin: 5px 0 0;
  }

  .button {
    transition: all .2s ease-out;
    outline: 0;
    border: 0;
    padding: 10px;
    word-wrap: break-word;
    line-height: 1.4em;
    hyphens: auto;
    background: #000;
    font-family: sans-serif;
    font-size: 10px;
    font-weight: 100;
    font-style: normal;
    letter-spacing: 2px;
    color: #fff;
    text-transform: uppercase;

    &:hover {
      opacity: .6;
    }

    &[disabled] {
      opacity: .2;
      pointer-events: none;
    }

    &--active {
      background: #fff;
      color: #111;
    }

    &--quit {
      background: #b70b0b;
    }
  }
</style>
