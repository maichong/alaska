import * as React from 'react';
import * as _ from 'lodash';
import * as classnames from 'classnames';
import { FieldViewProps } from 'alaska-admin-view';

function createLayout(layout: string): React.ReactNode {
  let columns: string[] = layout.split('-').map((cellCount) => _.repeat('0', parseInt(cellCount)));

  let els = columns.map((str, col) => (
    <ul key={col}>
      {_.map(str, (z, cell) => <li key={cell} />)}
    </ul>
  ));

  return <div className="showcase-layout-row">{els}</div>;
}

const layouts: { [layout: string]: React.ReactNode } = {
  '1': createLayout('1'),
  '1-1': createLayout('1-1'),
  '1-1-1': createLayout('1-1-1'),
  '1-1-1-1': createLayout('1-1-1-1'),
  '1-1-1-1-1': createLayout('1-1-1-1-1'),
  '1-2': createLayout('1-2'),
  '2-1': createLayout('2-1'),
  '2-3': createLayout('2-3'),
  '3-2': createLayout('3-2'),
  // 1-1
  '1-1-2': createLayout('1-1-2'),
  '1-1-3': createLayout('1-1-3'),
  // 1-2
  '1-2-1': createLayout('1-2-1'),
  '1-2-2': createLayout('1-2-2'),
  '1-2-3': createLayout('1-2-3'),
  // 1-3
  '1-3-1': createLayout('1-3-1'),
  '1-3-2': createLayout('1-3-2'),
  '1-3-3': createLayout('1-3-3'),
  // 2-1
  '2-1-1': createLayout('2-1-1'),
  '2-1-2': createLayout('2-1-2'),
  '2-1-3': createLayout('2-1-3'),
  // 2-2
  '2-2-1': createLayout('2-2-1'),
  '2-2-3': createLayout('2-2-3'),
  // 2-3
  '2-3-1': createLayout('2-3-1'),
  '2-3-2': createLayout('2-3-2'),
  '2-3-3': createLayout('2-3-3'),
  // 3-1
  '3-1-1': createLayout('3-1-1'),
  '3-1-2': createLayout('3-1-2'),
  '3-1-3': createLayout('3-1-3'),
  // 3-2
  '3-2-1': createLayout('3-2-1'),
  '3-2-2': createLayout('3-2-2'),
  '3-2-3': createLayout('3-2-3'),
  // 3-3
  '3-3-1': createLayout('3-3-1'),
  '3-3-2': createLayout('3-3-2'),
};

export default class ShowcaseLayoutSelector extends React.Component<FieldViewProps> {
  render() {
    let {
      className,
      field,
      disabled,
      value,
      onChange
    } = this.props;
    className += ' showcase-layout-field';

    let label = field.nolabel ? '' : field.label;

    let inputElement;
    if (field.fixed) {
      inputElement = <div className="showcase-layout-item">{layouts[value]}</div>;
    } else {
      inputElement = _.map(layouts, (layout, key: string) => {
        return (
          <div
            key={key}
            className={classnames('showcase-layout-item', { active: value === key })}
            onClick={disabled ? null : () => onChange(key)}
          >{layout}</div>
        );
      });
    }

    if (field.horizontal) {
      return (
        <div className={className}>
          <label className="col-sm-2 col-form-label">{label}</label>
          <div className="col-sm-10">
            {inputElement}
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        {label ? <label className="col-form-label">{label}</label> : null}
        {inputElement}
      </div>
    );
  }
}
