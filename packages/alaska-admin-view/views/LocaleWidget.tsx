import * as _ from 'lodash';
import * as tr from 'grackle';
import * as React from 'react';
import { LangGroup } from 'alaska-locale';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import { WidgetProps, State } from '..';
import * as settingsRedux from '../redux/settings';

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
    return (
      <li className="locale-widget">
        <ButtonDropdown
          isOpen={this.state.localeOpen}
          toggle={() => this.setState({ localeOpen: !localeOpen })}
        >
          <DropdownToggle color="default">
            <img src={`img/locales/${locale}.png`} alt="" />
          </DropdownToggle>
          <DropdownMenu>
            {
              list.map((key) => (
                <DropdownItem
                  key={key}
                  onClick={(() => this.handleChange(key))}
                >
                  <img src={`img/locales/${key}.png`} alt="" />
                  {tr(key)}
                </DropdownItem>
              ))
            }
          </DropdownMenu>
        </ButtonDropdown>
      </li>
    );
  }
}

export default connect(
  ({ settings }: State) => ({ locale: settings.locale, locales: settings.locales }),
  (dispatch) => bindActionCreators({
    localeSetting: settingsRedux.localeSetting
  }, dispatch)
)(LocaleWidget);
