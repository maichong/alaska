import * as React from 'react';
import { FilterViewProps } from 'alaska-admin-view';
import * as tr from 'grackle';

interface State {
  value: boolean;
}

export default class CheckboxFieldFilter extends React.Component<FilterViewProps, State> {
  constructor(props: FilterViewProps) {
    super(props);
    this.state = {
      value: props.value !== false && props.value !== 'false'
    };
  }

  componentDidMount() {
    this.props.onChange(this.state.value);
  }

  handleClick1 = () => {
    this.setState({ value: false });
    this.props.onChange(false);
  };

  handleClick2 = () => {
    this.setState({ value: true });
    this.props.onChange(true);
  };

  render() {
    let { className, field, onClose } = this.props;
    const { value } = this.state;
    const buttonClassName = 'btn btn-light';
    const buttonClassNameActive = 'btn btn-success';
    return (
      <div className={className + ' checkbox-field-filter align-items-center form-group'}>
        <label className="col-2 col-form-label text-right">{field.label}</label>
        <div className="col-10">
          <div className="btn-group">
            <button
              className={!value ? buttonClassNameActive : buttonClassName}
              onClick={this.handleClick1}
            >{tr('no')}
            </button>
            <button
              className={value ? buttonClassNameActive : buttonClassName}
              onClick={this.handleClick2}
            >{tr('yes')}
            </button>
          </div>
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}

