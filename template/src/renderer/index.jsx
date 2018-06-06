import App from '@/App';
import * as reducers from '@/store';
import { webFrame } from 'electron';
import log from 'electron-log';
import Admin from 'electron-react-builder/app/renderer/Admin';
import React from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { Provider, connect } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';

log.info(`RENDERER`, `Process started`);

webFrame.setZoomFactor(1);
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

const ConnectedIntlProvider = connect((state) => ({
  locale: state.intl.locale,
  key: state.intl.locale,
  messages: state.intl.translations }))(IntlProvider);

const store = createStore(combineReducers(reducers), {}, applyMiddleware(thunk));

render(
  <Admin/>,
  document.getElementById(`admin`)
);

render(
  <Provider store={store}>
    <ConnectedIntlProvider>
      <App/>
    </ConnectedIntlProvider>
  </Provider>,
  document.getElementById(`app`)
);
