import * as reducers from '@/store';
import { webFrame } from 'electron';
import log from 'electron-log';
import Admin from 'electron-react-builder/app/renderer/Admin';
import routes from 'electron-react-builder/app/renderer/routes';
import React from 'react';
import { hydrate, render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { Provider, connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter as Router } from 'react-router-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';

log.info(`RENDERER`, `Process started`);

webFrame.setZoomFactor(1);
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

const ConnectedIntlProvider = connect((state) => ({
  locale: state.i18n.locale,
  key: state.i18n.locale,
  messages: state.i18n.messages }))(IntlProvider);

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

if (process.env.NODE_ENV === `development`) {
  render(<Admin/>, document.getElementById(`admin`));
  render(markup(routes), document.getElementById(`app`));
}
else {
  hydrate(<Admin/>, document.getElementById(`admin`));
  hydrate(markup(routes), document.getElementById(`app`));
}
