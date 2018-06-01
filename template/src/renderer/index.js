import { getRoutes } from '@/plugins/router';
import * as reducers from '@/store';
import { webFrame } from 'electron';
import log from 'electron-log';
import React from 'react';
import { hydrate, render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { Provider, connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter as Router } from 'react-router-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';

const ConnectedIntlProvider = connect((state) => ({ locale: state.i18n.locale, key: state.i18n.locale, messages: state.i18n.messages }))(IntlProvider);
const store = createStore(combineReducers(reducers), {}, applyMiddleware(thunk));

const markup = (r) => (
  <Provider store={store}>
    <ConnectedIntlProvider>
      <Router>
        {renderRoutes(r)}
      </Router>
    </ConnectedIntlProvider>
  </Provider>
);

log.info(`RENDERER`, `Process started`);

webFrame.setZoomFactor(1);
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

if (process.env.NODE_ENV === `development`) {
  render(markup(getRoutes()), document.getElementById(`app`));
}
else {
  hydrate(markup(getRoutes()), document.getElementById(`app`));
}
