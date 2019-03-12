import * as React from 'react';
import { FilterViewProps } from 'alaska-admin-view';
import { TextFilterOptions } from '..';

export default class TextFieldFilter extends React.Component<FilterViewProps<TextFilterOptions>> {
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
    let { className, field, value, options, onSearch } = this.props;

    if (value && typeof value === 'object') {
      // @ts-ignore
      value = value.$regex;
    }

    let style: any = {
      maxWidth: options.maxWidth || '240px'
    };

    if (options.width) {
      style.width = options.width;
    } else {
      className += ` col-${options.col || 2}`;
    }

    let el = <input
      type="text"
      className="form-control"
      value={value as string}
      onChange={this.handleChange}
      onKeyPress={(e) => e.key === 'Enter' && onSearch()}
    />;

    if (!options.nolabel) {
      el = <div className="input-group">
        <div className="input-group-prepend">
          <div className="input-group-text">{field.label}</div>
        </div>
        {el}
      </div>;
    }

    return (
      <div style={style} className={`${className} text-field-filter ${options.className || ''}`}>
        {el}
      </div>
    );
  }
}
