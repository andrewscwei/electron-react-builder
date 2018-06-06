import theme from '@/styles/theme';
import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ThemeProvider, injectGlobal } from 'styled-components';
import normalize from 'styled-normalize';

injectGlobal`
  ${normalize}

  html,
  body {
    background: #0e0d10;
  }

  html,
  body,
  #app {
    box-sizing: border-box;
    height: 100%;
    margin: 0;
    padding: 0;
    text-rendering: optimizeLegibility;
    width: 100%;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-text-stroke: 0;
  }

  /* TransitionGroup container */
  #app > div {
    height: 100%;
    width: 100%;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    padding: 0;
    font-weight: 300;
  }

  a,
  li,
  p {
    font-weight: 300;
    list-style: none;
    margin: 0;
    padding: 0;
    text-decoration: none;
  }

  ol,
  ul {
    margin: 0;
    padding: 0;
  }

  span {
    font-family: inherit;
    font-weight: inherit;
    text-decoration: inherit;
  }

  a,
  button {
    outline: none;
    border: none;
    background: transparent;
  }

  em {
    font-style: normal;
    text-decoration: none;
  }

  .fade-enter {
    opacity: 0;
  }

  .fade-enter.fade-enter-active {
    opacity: 1;
    transition: all .3s;
  }

  .fade-exit {
    opacity: 1;
  }

  .fade-exit.fade-exit-active {
    opacity: 0;
    transition: all .3s;
  }
`;

export default class App extends PureComponent {
  generateRoutes = () => {
    return $routes.map((route, index) => {
      const { path, component } = route;
      const Component = require(`@/pages/${component}`).default;
      return <Route path={path} component={Component} key={index}/>;
    });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Router>
          <Route render={({ location }) => (
            <TransitionGroup>
              <CSSTransition key={location.key} timeout={300} classNames='fade'>
                <Switch location={location}>{this.generateRoutes()}</Switch>
              </CSSTransition>
            </TransitionGroup>
          )}/>
        </Router>
      </ThemeProvider>
    );
  }
}
