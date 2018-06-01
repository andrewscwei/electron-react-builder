import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class Settings extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  }

  render() {
    const { className } = this.props;

    return (
      <div className={className}>
      </div>
    );
  }
}
