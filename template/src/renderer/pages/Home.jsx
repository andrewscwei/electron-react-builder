import Logo from '@/components/Logo';
import { increment, reset } from '@/store/counter';
import { changeLocale } from '@/store/intl';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { FormattedHTMLMessage } from 'react-intl';
import open from 'open';

const StyledLogo = styled(Logo)`
  margin-bottom: 50px;
  height: 140px;
`;

const StyledRoot = styled.div`
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

    a, button {
      align-items: center;
      background: ${props => props.theme.buttonColor};
      color: ${props => props.theme.buttonTextColor};
      cursor: pointer;
      display: flex;
      justify-content: center;
      font-family: ${props => props.theme.font};
      font-size: .7em;
      font-weight: 600;
      height: 50px;
      text-transform: uppercase;
      letter-spacing: 2px;
      transition: opacity .2s ease-out;
      width: 150px;

      :hover {
        opacity: .6;
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

    em {
      opacity: .2;
    }
  }

  p {
    color: ${props => props.theme.textColor};
    font-family: ${props => props.theme.font};
    font-size: 1em;
    text-align: center;

    a {
      color: ${props => props.theme.accentColor};
      font-weight: 600;
      transition: opacity .2s ease-out;

      &:hover {
        opacity: .6;
      }
    }
  }
`;

const mapStateToProps = (state) => ({ locale: state.intl.locale, t: state.intl.translations, count: state.counter.count });
const mapDispatchToProps = (dispatch) => bindActionCreators({ changeLocale, incrementCount: increment, resetCount: reset }, dispatch);

@connect(mapStateToProps, mapDispatchToProps)
export default class Home extends PureComponent {
  static propTypes = {
    locale: PropTypes.string.isRequired,
    t: PropTypes.object.isRequired,
    count: PropTypes.number.isRequired,
    changeLocale: PropTypes.func.isRequired,
    incrementCount: PropTypes.func.isRequired,
    resetCount: PropTypes.func.isRequired,
  }

  componentDidMount() {
    if (!this.rootNode) return;

    this.rootNode.querySelectorAll(`[href]`).forEach(el => {
      el.addEventListener(`click`, e => {
        e.preventDefault();
        open(e.target.getAttribute(`href`));
      });
    });
  }

  toggleLocale = () => {
    if (this.props.locale === `en`) {
      this.props.changeLocale(`ja`);
    }
    else {
      this.props.changeLocale(`en`);
    }
  }

  render() {
    const { t, count, incrementCount, resetCount } = this.props;

    return (
      <StyledRoot innerRef={el => this.rootNode = el}>
        <StyledLogo/>
        <summary>
          <h1>
            <FormattedHTMLMessage id='hello' values={{ count: count, count2: count*2 }}/>
          </h1>
          <p dangerouslySetInnerHTML={{ __html: t[`description`] }}/>
        </summary>
        <nav>
          <button onClick={this.toggleLocale}>{t[`switch-lang`]}</button>
          <button onClick={incrementCount}>{t[`increment`]}</button>
          <button onClick={resetCount}>{t[`reset`]}</button>
        </nav>
      </StyledRoot>
    );
  }
}
