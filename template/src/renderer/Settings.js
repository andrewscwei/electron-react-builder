import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Root = styled.div`

`;

export default class Settings extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  }

  render() {
    const { className } = this.props;

    return (
      <Root className={className}>
      </Root>
    );
  }
}
