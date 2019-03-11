import * as React from 'react';
import { FilterViewProps } from 'alaska-admin-view';

export default class TextFieldFilter extends React.Component<FilterViewProps> {
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { onChange, options } = this.props;
    if (options.exact) {
      onChange(event.target.value);
    } else {
      onChange({
        // @ts-ignore
        $regex: event.target.value
      });
    }
  };

  render() {
    let { className, field, value, onSearch } = this.props;

    if (value && typeof value === 'object') {
      // @ts-ignore
      value = value.$regex;
    }

    return (
      <div className={`${className} text-field-filter col-sm-2`}>
        <div className="input-group">
          <div className="input-group-prepend">
            <div className="input-group-text">{field.label}</div>
          </div>
          <input
            type="text"
            className="form-control"
            value={value as string}
            onChange={this.handleChange}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
      </div>
    );
  }
}
