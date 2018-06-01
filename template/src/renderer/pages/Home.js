import Logo from '@/components/Logo';
import { incrementOnce, incrementTwice } from '@/store/counter';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

const StyledLogo = styled(Logo)`
  margin-bottom: 50px;
  height: 140px;
`;

const Root = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;

  nav {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: no-wrap;
    justify-content: center;
    margin-top: 30px;

    > * {
      :not(:last-child) {
        margin-right: 10px;
      }
    }
  }

  h1 {
    color: ${props => props.theme.accentColor};
    font-family: ${props => props.theme.font};
    font-size: 4em;
    font-weight: 600;
    margin: 0 0 20px;
    text-align: center;
  }

  p {
    color: ${props => props.theme.textColor};
    font-family: ${props => props.theme.font};
    font-size: 1em;
    text-align: center;

    em {
      color: ${props => props.theme.accentColor};
    }
  }

  a, button {
    align-items: center;
    background: ${props => props.theme.buttonColor};
    color: ${props => props.theme.buttonTextColor};
    cursor: pointer;
    display: flex;
    justify-content: center;
    font-family: ${props => props.theme.font};
    font-size: .7em;
    height: 50px;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: opacity .2s ease-out;
    width: 150px;

    :hover {
      opacity: .6;
    }
  }
`;

const mapStateToProps = (state) => ({ locale: state.i18n.locale, t: state.i18n.messages, count: state.counter.count });
const mapDispatchToProps = (dispatch) => bindActionCreators({ incrementOnce, incrementTwice }, dispatch);

@connect(mapStateToProps, mapDispatchToProps)
export default class Home extends PureComponent {
  static propTypes = {
    locale: PropTypes.string.isRequired,
    t: PropTypes.object.isRequired,
    count: PropTypes.number.isRequired,
    incrementOnce: PropTypes.func.isRequired,
    incrementTwice: PropTypes.func.isRequired,
  }

  static defaultProps = {
    t: {},
  }

  render() {
    const { locale, t, count, incrementOnce, incrementTwice } = this.props;

    return (
      <Root>
        <StyledLogo/>
        <summary>
          <h1>
            <FormattedMessage
              id='hello'
              values={{
                count: count,
                count2: count*2,
              }}
            />
          </h1>
          <p dangerouslySetInnerHTML={{ __html: t[`description`] }}/>
        </summary>
        <nav>
          <Link to={locale === `en` ? `/jp` : `/`}>{t[`switch-lang`]}</Link>
          <button onClick={incrementOnce}>{t[`increment`]}</button>
          <button onClick={incrementTwice}>{t[`increment-twice`]}</button>
        </nav>
      </Root>
    );
  }
}
