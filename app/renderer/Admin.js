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
import styled from 'styled-components';
import UpdateStatus from '../enums/UpdateStatus';

// Timeout in between click intervals when activating the admin panel, in ms.
const ACTIVATION_TIMEOUT_INTERVAL = 500;

// Number of times to click on the top left corner of the screen to activate the
// admin panel.
const MAX_ACTIVATION_COUNT = 5;

// Width of the admin panel.
const PANEL_WIDTH = 300;

// Instance of the Electron browser window.
const currentWindow = remote.getCurrentWindow();

const Root = styled.div`
  background: #0e0d10;
  box-sizing: border-box;
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
  width: ${PANEL_WIDTH}px;
  z-index: 16777271;

  > div {
    box-sizing: border-box;
    flex-shrink: 0;
  }
`;

const Status = styled.div`
  align-items: center;
  background: #483eb5;
  display: flex;
  flex-direction: row;
  font-size: 13px;
  justify-content: center;
  height: 50px;
  letter-spacing: 1.6px;
  padding: 0 10px;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
  width: 100%;
  word-wrap: none;

  span {
    color: #fff;
    font-family: monospace;
    font-weight: 600;
    max-height: 2em;
    overflow: hidden;
    line-height: 1em;
    letter-spacing: .8px;
    width: 100%;
    white-space: pre-line;
    word-break: break-all;
  }
`;

const Header = styled.div`
  padding: 30px 10px;

  > aside {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: no-wrap;
    justify-content: flex-start;
    margin-top: 10px;

    > * {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }

    > span {
      align-items: center;
      background: #483eb5;
      border-radius: 5px;
      color: #fff;
      display: flex;
      font-family: monospace;
      font-size: 12px;
      font-weight: 600;
      height: 20px;
      justify-content: center;
      letter-spacing: .5px;
      padding: 0 8px;
    }
  }

  h1 {
    color: #fff;
    font-family: sans-serif;
    font-size: 24px;
    letter-spacing: .5px;
    margin: 0;
    text-align: left;
    text-transform: uppercase;
  }
`;

const SettingsContainer = styled(Settings)`
  flex-grow: 1;
  height: auto;
  padding: 20px 10px;
  width: 100%;
`;

const Controls = styled.div`
  width: 100%;
  height: auto;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;

  button {
    background: #000;
    border: 0;
    color: #fff;
    cursor: pointer;
    font-family: sans-serif;
    font-size: 10px;
    font-style: normal;
    font-weight: 100;
    letter-spacing: 2px;
    margin: 2.5px;
    width: ${(PANEL_WIDTH - (5 * (3 + 2) + 20)) / 3}px;
    height: ${(PANEL_WIDTH - (5 * (3 + 2) + 20)) / 3}px;
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
      background: #483eb5;
    }

    &[important] {
      background: #b70b0b;
    }
  }
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
    case UpdateStatus.AVAILABLE:
      this.setState({ appStatus: `Update is available` });
      break;
    case UpdateStatus.NOT_AVAILABLE:
      this.setState({ appStatus: `App is up-to-date` });
      break;
    case UpdateStatus.CHECKING:
      this.setState({ appStatus: `Checking for update...` });
      break;
    case UpdateStatus.ERROR:
      this.setState({ appStatus: `${data.error}` });
      // eslint-disable-next-line no-console
      console.error(data.error);
      break;
    case UpdateStatus.DOWNLOADING: {
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
    case UpdateStatus.DOWNLOADED:
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
          <h1>{appName}</h1>
          <aside>
            <span>{appVersion}</span>
            <span>{ipAddress}</span>
          </aside>
        </Header>
        <SettingsContainer/>
        <Controls>
          <button active={debugEnabled ? `` : undefined} onClick={this.toggleDebugMode}>Debug Mode</button>
          <button onClick={this.checkForUpdates}>Check Updates</button>
          <button onClick={this.installUpdates} disabled={!updateReady}>Install updates</button>
          <button onClick={this.refresh}>Reload</button>
          <button onClick={this.deactivate}>Close Panel</button>
          <button important='true' onClick={this.quitApp}>Quit<br/>App</button>
        </Controls>
      </Root>
    );
  }
}
