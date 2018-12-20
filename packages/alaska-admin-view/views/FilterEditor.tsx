import * as tr from 'grackle';
import * as _ from 'lodash';
import * as React from 'react';
import Node from './Node';
import { FilterEditorProps, views } from '..';

export default class FilterEditor extends React.Component<FilterEditorProps> {
  handleChange = (path: string, v: any) => {
    this.props.onChange(_.assign({}, this.props.value, { [path]: v }));
  };

  handleClose(path: string) {
    this.props.onChange(_.omit(this.props.value, path));
  }

  render() {
    const { model, value } = this.props;
    return (
      <Node
        className="filter-editor form-horizontal"
        wrapper="FilterEditor"
        props={this.props}
      >
        {
          _.map(value, (filterValue, path) => {
            let field = model.fields[path];
            if (!field) return null;
            let FilterView = views.components[field.filter];
            if (!FilterView) return null;
            let className = `${model.id}-${field.path}-filter row field-filter`;
            let cfg = _.assign({}, field, {
              label: tr(field.label, model.serviceId)
            });
            return (
              <FilterView
                key={path}
                className={className}
                field={cfg}
                value={filterValue}
                model={model}
                onChange={(v: any) => this.handleChange(path, v)}
                onClose={() => this.handleClose(path)}
              />
            );
          })
        }
      </Node>
    );
  }
}
