import * as React from 'react';
import { FilterViewProps } from 'alaska-admin-view';
import { FilterObject, FilterValue, Filter } from 'alaska-model';
import * as tr from 'grackle';

// 1 等于
enum Modes { 'eq' = 1, 'ne' }
type State = {
  mode: number;
  value: string;
  error: boolean;
};

export default class TextFieldFilter extends React.Component<FilterViewProps, State> {

  constructor(props: FilterViewProps) {
    super(props);
    let propsValue: Filter = props.value || {};
    let mode: Modes = Modes.eq;
    let value: FilterValue = '';
    let inverse: boolean = false;
    if (propsValue && typeof propsValue === 'object') {
      let condition: FilterObject = propsValue as FilterObject;
      if (condition.$eq) {
        value = condition.$eq.toString();
        mode = 1;
      } else if (condition.$ne) {
        value = condition.$ne.toString();
        mode = 2;
      }
    }
    let error = false;
    if (!value) {
      error = true;
    }
    this.state = {
      mode,
      value,
      error
    };
  }

  handleMode = (mode: number) => {
    this.setState({ mode }, () => this.handleBlur());
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: event.target.value });
  };

  handleBlur = () => {
    let { value, mode } = this.state;
    if (typeof value === 'undefined') {
      this.setState({ error: true });
      return;
    }
    this.setState({ error: false });
    let tag = '$eq';
    if (mode === 2) {
      tag = '$ne';
    }
    this.props.onChange({ [tag]: value });
  };

  render() {
    let { className, field, onClose } = this.props;
    const { mode, value, error } = this.state;
    const buttonClassName = 'btn btn-light';
    const buttonClassNameActive = 'btn btn-success';
    className += ` text-field-filter align-items-center${error ? ' error' : ''}`;
    return (
      <div className={className}>
        <label className="col-2 col-form-label text-right">{field.label}</label>
        <div className="form-inline col-10">
          <div className="form-group btn-group">
            <a
              className={mode === 1 ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(1)}
            >{tr('equal')}
            </a>
            {/* <a
              className={mode === 3 ? buttonClassNameActive : buttonClassName}
              onClick={()=> this.handleMode(3)}
            >{tr('contain')}
            </a> */}
          </div>
          <input
            type="text"
            className="form-control"
            style={{ width: 'auto' }}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={value}
          />
          <a
            className={mode === 2 ? buttonClassNameActive : buttonClassName}
            onClick={() => this.handleMode(2)}
          >{tr('inverse')}
          </a>
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}
