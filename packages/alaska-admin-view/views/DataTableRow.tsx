import * as React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import Checkbox from '@samoyed/checkbox';
import { bindActionCreators } from 'redux';
import Node from './Node';
import ListItemActions from './ListItemActions';
import * as ActionRedux from '../redux/action';
import * as refreshRedux from '../redux/refresh';
import { DataTableRowProps, Field, StoreState, views, ActionRequestPayload } from '..';

interface Props extends DataTableRowProps {
  superMode: boolean;
  actionRequest: (req: ActionRequestPayload) => any;
  refresh: () => any;
}

class DataTableRow extends React.Component<Props> {
  handleChange = () => {
    let { record, onSelect, selected } = this.props;
    if (onSelect) {
      onSelect(record, !selected);
    }
  }

  handleShow = () => {
    let { model, record, history } = this.props;
    history.push(`/edit/${model.serviceId}/${model.modelName}/${record._id}`);
  };

  handleActive = () => {
    const { onActive, record } = this.props;
    if (onActive) {
      onActive(record);
    }
  };

  render() {
    let {
      model, columns, record, selected, active,
      onSelect, superMode, history, actionRequest, refresh
    } = this.props;

    let el = <tr
      key={`${record._id}-data-table-row`}
      className="data-table-row"
      onClick={this.handleActive}
      onDoubleClick={this.handleShow}
    >
      <Node
        tag={false}
        wrapper="DataTableRow"
        props={this.props}
        className="data-table-row"
      >
        {
          onSelect ?
            <td onClick={(e: any) => e.stopPropagation()}>
              <Checkbox value={selected} onChange={this.handleChange} />
            </td>
            : null
        }
        {
          columns.split(' ').map((key: string) => {
            let field: Field = model.fields[key];
            if (!field || field.hidden === true || !field.cell) return null;
            if (field.super && !superMode) return null;
            let Cell = views.components[field.cell];
            return <td key={key}>
              {
                Cell ?
                  <Cell model={model} field={field} value={record[key]} />
                  : (record[key] || '').toString()
              }
            </td>;
          })
        }
        <td className="actions">
          <ListItemActions
            model={model}
            record={record}
            history={history}
            superMode={superMode}
            refresh={refresh}
            actionRequest={actionRequest}
          />
        </td>
      </Node>

    </tr>;
    if (active && model.preView) {
      let View = views.components[model.preView];
      if (View) {
        let preivew = (
          <tr key={`${record._id}-preivew`} className="preview-line">
            <td colSpan={columns.length + (onSelect ? 2 : 1)}>
              <View
                model={model}
                columns={columns}
                record={record}
              />
            </td>
          </tr>
        );
        return [el, preivew];
      }
      console.warn(`Missing : ${model.preView}`);
    }
    return el;
  }
}
export default connect(
  ({ settings }: StoreState) => ({ superMode: settings.superMode }),
  (dispatch) => bindActionCreators({
    actionRequest: ActionRedux.actionRequest,
    refresh: refreshRedux.refresh,
  }, dispatch)
)(DataTableRow);
