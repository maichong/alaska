import * as tr from 'grackle';
import * as React from 'react';
import * as DateTime from 'react-datetime';
import * as moment from 'moment';
import { FilterViewProps } from 'alaska-admin-view';
import { FilterObject } from 'alaska-model';

enum Modes { 'eq' = 1, 'gte', 'lte', 'range' }
interface State {
  value1: moment.Moment;
  value2: moment.Moment;
  error: boolean;
  mode: Modes;
}

export default class DatetimeFieldFilter extends React.Component<FilterViewProps, State> {
  constructor(props: FilterViewProps) {
    super(props);
    let { value } = props;
    let value1: moment.Moment = moment();
    let value2 = moment();
    if (value && typeof value === 'string') {
      value1 = moment(value.toString());
    }
    let mode: Modes = Modes.eq;
    if (value && typeof value === 'object') {
      let condition: FilterObject = value as FilterObject;
      if (condition.$gte) {
        value1 = moment(condition.$gte.toString());
        mode = Modes.gte;
        if (condition.$lte) {
          value2 = moment(condition.$lte.toString());
          mode = Modes.range;
        }
      } else if (condition.$lte) {
        value1 = moment(condition.$lte.toString());
        mode = Modes.lte;
      }
    }
    let error = false;
    if (!value1) {
      error = true;
    }
    if (mode === Modes.range && (!value2 || value1.isAfter(value2))) {
      error = true;
    }
    this.state = {
      mode, // 1 等于 2大于 3小于 4区间
      value1,
      value2,
      error
    };
  }

  handleMode(mode: Modes) {
    this.setState({ mode }, () => this.handleBlur());
  }
  handleChange1 = (value: string) => {
    this.setState({
      value1: moment(value)
    }, () => this.handleBlur());
  };
  handleChange2 = (value: string) => {
    this.setState({
      value2: moment(value)
    }, () => this.handleBlur());
  };
  handleBlur = () => {
    let { mode, value1, value2 } = this.state;
    if (!value1) {
      this.setState({ error: true });
      return;
    }
    if (mode === Modes.range && (!value2 || value1.isAfter(value2))) {
      this.setState({ error: true });
      return;
    }
    this.setState({ error: false });
    let formatValue = value1.format('YYYY-MM-DD');
    let filter: FilterObject = { $eq: formatValue };
    if (mode === Modes.gte) {
      filter = { $gte: formatValue };
    } else if (mode === Modes.lte) {
      filter = { $lte: formatValue };
    } else if (mode === Modes.range) {
      filter = { $gte: formatValue, $lte: value2.format('YYYY-MM-DD') };
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
    className += ` datetime-field-filter align-items-center${error ? ' error' : ''}`;
    return (
      <div className={className}>
        <label className="col-2 col-form-label text-right">{field.label}</label>
        <div className="form-inline col-10">
          <div className="form-group btn-group">
            <button
              className={mode === Modes.eq ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(Modes.eq)}
            >{tr('equal')}
            </button>
            <button
              className={mode === Modes.gte ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(Modes.gte)}
            >{tr('greater')}
            </button>
            <button
              className={mode === Modes.lte ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(Modes.lte)}
            >{tr('lesser')}
            </button>
            <button
              className={mode === Modes.range ? buttonClassNameActive : buttonClassName}
              onClick={() => this.handleMode(Modes.range)}
            >{tr('between')}
            </button>
          </div>
          <div className="form-group">
            <DateTime
              value={value1}
              dateFormat="YYYY-MM-DD"
              timeFormat={false}
              onChange={this.handleChange1}
            />
          </div>
          {
            mode === Modes.range ?
              <div className="form-group">
                <DateTime
                  value={value2}
                  dateFormat="YYYY-MM-DD"
                  timeFormat={false}
                  onChange={this.handleChange2}
                />
              </div> : null
          }
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}
