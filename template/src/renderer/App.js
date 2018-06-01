import theme from '@/styles/theme';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { renderRoutes } from 'react-router-config';
import { ThemeProvider, injectGlobal } from 'styled-components';
import normalize from 'styled-normalize';

export default class App extends PureComponent {
  static propTypes = {
    route: PropTypes.object.isRequired,
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        { renderRoutes(this.props.route.routes) }
      </ThemeProvider>
    );
  }
}

injectGlobal`
  ${normalize}

  body {
    background: #111;
  }

  html, body, #app {
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

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    padding: 0;
    font-weight: 300;
  }

  a, li, p {
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
    font-style: normal;
    text-decoration: none;
  }
`;
