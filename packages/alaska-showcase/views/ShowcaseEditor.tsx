import * as React from 'react';
import * as _ from 'lodash';
import * as tr from 'grackle';
import * as immutable from 'seamless-immutable';
import { FieldViewProps, store } from 'alaska-admin-view';
import Editor from 'alaska-admin-view/views/Editor';
import { ShowcaseItem } from '..';

interface State {
  actived: number;
}

export default class ShowcaseEditor extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      actived: -1
    };
  }

  handleChange = (item: immutable.Immutable<ShowcaseItem>) => {
    let { value, onChange } = this.props;
    let { actived } = this.state;
    value = immutable(value || []).set(actived, item);
    onChange(value);
  };

  render() {
    let {
      className,
      disabled,
      value,
      record,
    } = this.props;
    let { actived } = this.state;
    let items = value || [];
    className += ' showcase-editor-field';

    let columns: string[] = record.layout.split('-').map((cellCount: string) => _.repeat('0', parseInt(cellCount)));

    let index = -1;
    let els = columns.map((cells, colIndex) => {
      let colClassName = '';
      let colStyle: any = { height: record.height };
      let firstCell = items[index + 1];
      if (firstCell && firstCell.width) {
        // 列宽度等于第一个单元格的宽度
        colStyle.width = firstCell.width;
      } else {
        // 如果此列的第一个单元格没有设置宽度，自动撑大
        colClassName += 'flex-fill';
      }
      return (
        <ul className={colClassName} key={colIndex} style={{ height: record.height }}>
          {_.map(cells, (z, cellIndex) => {
            index += 1;
            let _index = index;
            let item = items[index] || {};
            let cellClassName = actived === index ? 'active' : '';
            let cellStyle = {
              width: item.width,
              height: item.height
            };
            if (cellIndex !== 0) {
              // 不是此列的第一个单元格，那么宽度等于列宽度，自己的宽度无用
              cellStyle.width = colStyle.width;
              if (actived === _index) {
                className += ' no-width';
              }
            }
            if (cells.length === 1) {
              // 此列只有一格，单元格的高度等于整个橱窗
              cellStyle.height = record.height;
              if (actived === _index) {
                className += ' no-height';
              }
            }
            return (
              <li
                key={cellIndex}
                className={cellClassName}
                onClick={() => this.setState({ actived: _index })}
                style={cellStyle}
              >{item.pic ? <img style={cellStyle} src={item.pic.url} /> : ''}</li>
            );
          })}
        </ul>
      );
    });

    let form;
    if (actived < 0 || actived > index) {
      form = <div className="p-4">{tr('Please select a cell for edit')}</div>;
    } else {
      form = <Editor
        embedded
        model={store.getState().settings.models['alaska-showcase.ShowcaseItem']}
        record={immutable(items[actived] || {})}
        onChange={this.handleChange}
        disabled={disabled}
      />;
    }

    return (
      <div className={className}>
        <div className="showcase-preview">
          <div className="showcase-layout-row" style={{ width: record.width, height: record.height }}>{els}</div>
        </div>
        {form}
      </div>
    );
  }
}
