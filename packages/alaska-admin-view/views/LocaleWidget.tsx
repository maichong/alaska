import * as _ from 'lodash';
import * as tr from 'grackle';
import * as React from 'react';
import { LangGroup } from 'alaska-locale';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { WidgetProps, StoreState } from '..';
import * as settingsRedux from '../redux/settings';
import DropdownType from 'react-bootstrap/Dropdown';

const Dropdown: typeof DropdownType = require('react-bootstrap/Dropdown');

interface LocaleWidgetState {
  active: string;
  localeOpen: boolean;
}
interface Props extends WidgetProps {
  locale: string;
  locales: {
    [module: string]: LangGroup;
  };
  localeSetting: Function;
}

class LocaleWidget extends React.Component<Props, LocaleWidgetState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      active: props.locale || '',
      localeOpen: false
    };
  }

  handleChange = (key: string) => {
    this.setState({ active: key });
    this.props.localeSetting(key);
  }


  render() {
    let { locale, locales } = this.props;
    let { localeOpen } = this.state;
    if (!locale || !locales) {
      return null;
    }
    let list: string[] = [];
    _.forEach(locales, (server) => {
      _.forEach(server, (value, key: string) => {
        if (list.indexOf(key) < 0) {
          list.push(key);
        }
      });
    });
    // 少于两种语言，没必要显示切换按钮
    if (_.size(list) < 2) return null;
    return (
      <li className="locale-widget">
        <Dropdown
          show={this.state.localeOpen}
          onToggle={(isOpen: boolean) => this.setState({ localeOpen: isOpen })}
        >
          <Dropdown.Toggle variant="light" id="locale-widget">
            <img src={`img/locales/${locale}.png`} alt="" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {
              list.map((key) => (
                <Dropdown.Item
                  key={key}
                  onClick={(() => this.handleChange(key))}
                >
                  <img src={`img/locales/${key}.png`} alt="" />
                  {tr.locale(key)('lang')}
                </Dropdown.Item>
              ))
            }
          </Dropdown.Menu>
        </Dropdown>
      </li>
    );
  }
}

export default connect(
  ({ settings }: StoreState) => ({ locale: settings.locale, locales: settings.locales }),
  (dispatch) => bindActionCreators({
    localeSetting: settingsRedux.localeSetting
  }, dispatch)
)(LocaleWidget);
