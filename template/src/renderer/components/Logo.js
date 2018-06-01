import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Root = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;

  > figure {
    height: 100%;
    margin: 0px;
    padding: 0;

    :not(:last-child) {
      margin-right: 20px;
    }

    > svg {
      height: 100%;
      width: auto;
    }
  }
`;

const ElectronLogo = styled.figure`
  animation: rotate-cw 5s linear infinite;
  transform-origin: center;

  @keyframes rotate-cw {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ReactLogo = styled.figure`
  animation: rotate-ccw 8s linear infinite;
  transform-origin: center;

  @keyframes rotate-ccw {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
`;

export default class Logo extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  }

  render() {
    const { className } = this.props;

    return (
      <Root className={className}>
        <ElectronLogo dangerouslySetInnerHTML={{ __html: require(`!raw-loader!@/assets/images/electron-logo.svg`) }}/>
        <ReactLogo dangerouslySetInnerHTML={{ __html: require(`!raw-loader!@/assets/images/react-logo.svg`) }}/>
      </Root>
    );
  }
}
