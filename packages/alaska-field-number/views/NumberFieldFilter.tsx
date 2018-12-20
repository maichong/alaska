import * as React from 'react';
import { FilterViewProps } from 'alaska-admin-view';
import { FilterObject } from 'alaska-model';
import * as tr from 'grackle';

// 1 等于 2大于 4大于等于 4小于 5小于等于 6区间
enum Modes { 'eq' = 1, 'gt', 'gte', 'lt', 'lte', 'range' }
type State = {
  value1: string;
  value2: string;
  error: boolean;
  mode: Modes;
};

export default class NumberFieldFilter extends React.Component<FilterViewProps, State> {
  constructor(props: FilterViewProps) {
    super(props);
    let { value } = props;
    let value1: string = String(value);
    let value2: string = String(value);
    let mode: Modes = Modes.eq;
    if (value && typeof value === 'object') {
      let condition: FilterObject = value as FilterObject;
      if (condition.$gte) {
        value1 = condition.$gte.toString();
        // 大于等于
        mode = Modes.gte;
        if (condition.$lte) {
          value2 = condition.$lte.toString();
          // 范围
          mode = Modes.range;
        }
      } else if (condition.$lte) {
        // 小于等于
        mode = Modes.lte;
        value1 = condition.$lte.toString();
      } else if (condition.$gt) {
        // 大于
        mode = Modes.gt;
        value1 = condition.$gt.toString();
      } else if (condition.$lt) {
        // 小于
        mode = Modes.lt;
        value1 = condition.$lt.toString();
      }
    }
    let error = false;
    if (!value1 && value1.toString() !== '0') {
      error = true;
    }
    if (mode === Modes.range && ((!value2 && value2.toString() !== '0') || parseInt(value1) >= parseInt(value2))) {
      error = true;
    }
    this.state = {
      mode,
      value1,
      value2,
      error
    };
  }

  handleMode(mode: Modes) {
    this.setState({ mode }, () => this.handleBlur());
  }

  handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      value1: event.target.value
    });
  };

  handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      value2: event.target.value
    });
  };

  handleBlur = () => {
    const { mode, value1, value2 } = this.state;
    if (!value1 && value1.toString() !== '0') {
      this.setState({ error: true });
      return;
    }
    if (mode === Modes.range && ((!value2 && value2.toString() !== '0') || parseInt(value1) >= parseInt(value2))) {
      this.setState({ error: true });
      return;
    }
    this.setState({ error: false });
    let filter: FilterObject = { $eq: value1 };
    if (mode === Modes.gt) {
      filter = { $gt: value1 };
    } else if (mode === Modes.gte) {
      filter = { $gte: value1 };
    } else if (mode === Modes.lt) {
      filter = { $lt: value1 };
    } else if (mode === Modes.lte) {
      filter = { $lte: value1 };
    } else if (mode === Modes.range) {
      filter = { $gte: value1, $lte: value2 };
    }
    this.props.onChange(filter);
  };

  render() {
    let { className, field, onClose } = this.props;
    const {
      mode, value1, value2, error
    } = this.state;
    const buttonClassName = 'btn btn-light';
    const buttonClassNameActive = 'btn btn-success';
    className += ` number-field-filter align-items-center${error ? ' error' : ''}`;
    return (
      <div className={className}>
        <div className="col-2 col-form-label text-right">{field.label}</div>
        <div className="form-inline col-10">
          <div className="form-group btn-group">
            <button
              className={mode === Modes.eq ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(Modes.eq)}
            >=
            </button>
            <button
              className={mode === Modes.gt ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(Modes.gt)}
            >&gt;
            </button>
            <button
              className={mode === Modes.lt ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(Modes.lt)}
            >&lt;
            </button>
            <button
              className={mode === Modes.gte ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(Modes.gte)}
            >&gt;=
            </button>
            <button
              className={mode === Modes.lte ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(Modes.lte)}
            >&lt;=
            </button>
            <button
              className={mode === Modes.range ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(Modes.range)}
            >{tr('between')}
            </button>
          </div>
          <input
            type="number"
            className="form-control"
            onChange={this.handleChange1}
            onBlur={this.handleBlur}
            value={value1}
          />
          {
            mode === Modes.range ? <input
              type="number"
              className="form-control"
              onChange={this.handleChange2}
              onBlur={this.handleBlur}
              value={value2}
            /> : null
          }
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}
