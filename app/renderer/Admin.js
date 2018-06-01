/**
 * @file Admin panel component. Once added, you can toggle this panel by
 *       clicking on the top left corner of the screen 5x consecutively within
 *       500ms intervals. This component handles the following for you:
 *         1. Toggling on-screen debugging
 *         2. Checks/installs app updates manually or automatically whenever the
 *            app is idle (override the default timeout in $config.idleTimeout)
 *         3. Other useful debugging features such as refreshing the app and
 *            quitting the app
 *
 *       This component expects that the app repo has a `Settings.vue` file in
 *       `@/components`. The Settings component is automatically loaded into
 *       this admin panel. Add app-specific options in there if you wish.
 */

import Settings from '@/Settings';
import { ipcRenderer, remote } from 'electron';
import ip from 'ip';
import React, { PureComponent } from 'react';
import styled, { injectGlobal } from 'styled-components';

// Timeout in between click intervals when activating the admin panel, in ms.
const ACTIVATION_TIMEOUT_INTERVAL = 500;

// Number of times to click on the top left corner of the screen to activate the
// admin panel.
const MAX_ACTIVATION_COUNT = 5;

// Updater status enums.
const UPDATE_STATUS = {
  IDLE: 0,
  CHECKING: 1,
  AVAILABLE: 2,
  NOT_AVAILABLE: 3,
  DOWNLOADING: 4,
  DOWNLOADED: 5,
  ERROR: 6,
};

// Instance of the Electron browser window.
const currentWindow = remote.getCurrentWindow();

const Root = styled.div`
  background: #111;
  box-sizing: border-box;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  font-family: sans-serif;
  height: 100vh;
  left: 0;
  margin: 0;
  overflow: hidden;
  position: fixed;
  top: 0;
  transform: ${props => props.active ? `translate3d(0, 0, 0)` : `translate3d(-100%, 0, 0)`};
  transition: transform .2s ease-out;
  width: 400px;
  z-index: 16777271;

  > div {
    box-sizing: border-box;
    flex-shrink: 0;
  }
`;

const Status = styled.div`
  align-items: center;
  background: #7011bf;
  display: flex;
  flex-direction: row;
  font-size: 13px;
  justify-content: center;
  height: 40px;
  letter-spacing: 1.6px;
  padding: 0 20px;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
  width: 100%;
  word-wrap: none;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
`;

const Header = styled.div`
  padding: 50px 20px 20px;

  h1 {
    font-family: sans-serif;
    font-size: 24px;
    letter-spacing: .5px;
    margin: 0;
    text-align: left;
    text-transform: uppercase;
  }

  h2 {
    color: #ccc;
    font-family: sans-serif;
    font-size: 16px;
    letter-spacing: .5px;
    margin: 0;
    text-transform: uppercase;
  }

  h4 {
    color: #999;
    font-family: sans-serif;
    font-size: 14px;
    letter-spacing: .5px;
    margin: 5px 0 0;
  }
`;

const StyledSettings = styled(Settings)`
  flex-grow: 1;
  height: auto;
  padding: 20px 20px;
  width: 100%;
`;

const Controls = styled.div`
  width: 100%;
  height: auto;
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;

  button {
    background: #000;
    border: 0;
    color: #fff;
    font-family: sans-serif;
    font-size: 10px;
    font-style: normal;
    font-weight: 100;
    letter-spacing: 2px;
    margin: 2.5px;
    width: ${(400 - (5 * (4 + 2) + 20)) / 4}px;
    height: ${(400 - (5 * (4 + 2) + 20)) / 4}px;
    hyphens: auto;
    line-height: 1.4em;
    outline: 0;
    padding: 10px;
    text-transform: uppercase;
    transition: all .2s ease-out;
    word-wrap: break-word;

    &:hover {
      opacity: .6;
    }

    &[disabled] {
      opacity: .2;
      pointer-events: none;
    }

    &[active] {
      background: #fff;
      color: #111;
    }
  }
`;

const QuitButton = styled.button`
  background: #b70b0b;
`;

export default class Admin extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      activationTimeout: null,
      idleTimeout: null,
      isActive: false,
      appStatus: `WARNING: For devs only`,
      updateReady: false,
      activationCount: 0,
      debugEnabled: false,
      appName: remote.app.getName(),
      appVersion: `v${remote.app.getVersion()}`,
      ipAddress: ip.address(),
    };
  }

  componentDidMount() {
    ipcRenderer.on(`update-status`, this.onUpdateStatusChange);
    ipcRenderer.on(`debug-enabled`, this.onDebugEnabled);

    document.addEventListener(`pointerup`, this.onPointerUp);
    document.addEventListener(`keyup`, this.onKeyUp);

    this.restartIdleTimeout();
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(`update-status`, this.onUpdateStatusChange);
    ipcRenderer.removeListener(`debug-enabled`, this.onDebugEnabled);

    document.removeEventListener(`pointerup`, this.onPointerUp);
    document.removeEventListener(`keyup`, this.onKeyUp);

    clearTimeout(this.idleTimeout);
    clearTimeout(this.activationTimeout);
  }

  /**
   * Method invoked when the window detects a pointer up event. When this
   * happens, restart the timeout event. Also, if the pointer is within 100px
   * of the top left corner, initiate the activation process. When the number of
   * occurance hits MAX_ACTIVATION_COUNT, bring out the admin panel.
   *
   * @param {Event} event
   */
  onPointerUp = (event) => {
    this.restartIdleTimeout();

    if (event.clientX > 100 || event.clientY > 100) return this.cancelActivation();

    this.setState({ activationCount: this.state.activationCount + 1 });
    this.waitForActivation();

    if (this.state.activationCount >= MAX_ACTIVATION_COUNT) {
      this.activate();
    }
  }

  /**
   * Method invoked when the window detects a key up event. When this
   * happens, restart the idle timeout.
   * @param {Event} event
   */
  onKeyUp = (event) => {
    this.restartIdleTimeout();
  }

  /**
   * Method invoked when the update status changes. This is triggered from
   * the main process.
   * @param {Event} event
   * @param {Object} data
   */
  onUpdateStatusChange = (event, data) => {
    switch (data.status) {
    case UPDATE_STATUS.AVAILABLE:
      this.setState({ appStatus: `Update is available` });
      break;
    case UPDATE_STATUS.NOT_AVAILABLE:
      this.setState({ appStatus: `App is up-to-date` });
      break;
    case UPDATE_STATUS.CHECKING:
      this.setState({ appStatus: `Checking for update...` });
      break;
    case UPDATE_STATUS.ERROR:
      this.setState({ appStatus: `${data.error}` });
      // eslint-disable-next-line no-console
      console.error(data.error);
      break;
    case UPDATE_STATUS.DOWNLOADING: {
      const toMB = (b) => ((b/(1024*1024)).toFixed(2));
      const progress = data.progress ? `(${Math.floor(data.progress.percent)}% of ${toMB(data.progress.total)}MB at ${toMB(data.progress.bytesPerSecond)}MB/s)` : ``;

      this.setState({
        updateReady: false,
        appStatus: `Downloading...${progress}`,
      });

      // eslint-disable-next-line no-console
      console.log(`Downloading...${progress}`);
      break;
    }
    case UPDATE_STATUS.DOWNLOADED:
      this.setState({
        updateReady: true,
        appStatus: `Update is ready to be installed`,
      });
      break;
    }
  }

  /**
   * Method invoked when on-screen debugging is toggled, triggered from the
   * main process.
   * @param {Event} event
   * @param {boolean} isEnabled
   */
  onDebugEnabled = (event, isEnabled) => {
    this.setState({ debugEnabled: isEnabled });
  }

  /**
   * Initiates the activation process. Begin counting the number of clicks and
   * ensure that consecutive clicks are within the specified time interval.
   */
  waitForActivation = () => {
    clearTimeout(this.state.activationTimeout);

    this.setState({
      activationTimeout: setTimeout(this.cancelActivation, ACTIVATION_TIMEOUT_INTERVAL),
    });
  }

  /**
   * Cancels the activation process altogether, resets the click count to 0.
   */
  cancelActivation = () => {
    clearTimeout(this.state.activationTimeout);

    this.setState({
      activationTimeout: null,
      activationCount: 0,
     });
  }

  /**
   * Restarts the idle timeout.
   */
  restartIdleTimeout = () => {
    if (process.env.NODE_ENV !== 'production') return;
    clearTimeout(this.state.idleTimeout);

    this.setState({
      idleTimeout: setTimeout(() => {
        ipcRenderer.send('idle');
        clearTimeout(this.state.idleTimeout);
        this.setState({ idleTimeout: null });
      }, $config.idleTimeout),
    });
  }

  /**
   * Activates the admin panel.
   */
  activate = () => {
    this.setState({ isActive: true });
    this.cancelActivation();
  }

  /**
   * Deactivates the admin panel.
   */
  deactivate = () => {
    this.setState({ isActive: false });
  }

  /**
   * Notifies the main process to toggle on-screen debugging.
   */
  toggleDebugMode = () => {
    ipcRenderer.send('toggle-debug-mode');
  }

  /**
   * Refreshes the Electron window.
   */
  refresh = () => {
    currentWindow.reload();
  }

  /**
   * Notifies the main process to check for updates.
   */
  checkForUpdates = () => {
    ipcRenderer.send('check-for-updates');
  }

  /**
   * Notifies the main process to install updates and restart.
   */
  installUpdates = () => {
    if (this.state.updateReady) ipcRenderer.send('install-updates');
  }

  /**
   * Quits the app.
   */
  quitApp = () => {
    remote.app.quit();
  }

  render() {
    const { appStatus, appVersion, debugEnabled, updateReady, appName, ipAddress, isActive } = this.state;

    return (
      <Root active={isActive}>
        <Status>
          <span>{appStatus}</span>
        </Status>
        <Header>
          <h2>Admin</h2>
          <h1>{appName}</h1>
          <h4>{appVersion} / {ipAddress}</h4>
        </Header>
        <StyledSettings/>
        <Controls>
          <button onClick={this.refresh}>Refresh</button>
          <button active={debugEnabled ? `` : undefined} onClick={this.toggleDebugMode}>Debug Mode</button>
          <button onClick={this.checkForUpdates}>Check for Updates</button>
          <button onClick={this.installUpdates} disabled={!updateReady}>Install updates</button>
          <button onClick={this.deactivate}>Close Panel</button>
          <QuitButton onClick={this.quitApp}>Quit App</QuitButton>
        </Controls>
      </Root>
    );
  }
}
