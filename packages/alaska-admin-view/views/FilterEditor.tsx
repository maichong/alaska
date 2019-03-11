import * as tr from 'grackle';
import * as _ from 'lodash';
import * as React from 'react';
import * as qs from 'qs';
import Node from './Node';
import SearchField from './SearchField';
import { FilterEditorProps, FilterView, views } from '..';

const flex = <div className="flex-fill" />;

interface State {
  _value?: any;
  filters: any;
}

export default class FilterEditor extends React.Component<FilterEditorProps, State> {
  constructor(props: FilterEditorProps) {
    super(props);
    this.state = {
      filters: {}
    };
  }

  static getDerivedStateFromProps(nextProps: FilterEditorProps, prevState: State): State | null {
    if (!_.isEqual(nextProps.value, prevState._value)) {
      return {
        _value: nextProps.value,
        filters: nextProps.value
      };
    }
    return null;
  }

  handleChange = (path: string, v: any) => {
    this.setState({
      filters: _.assign({}, this.state.filters, { [path]: v })
    });
  };

  handleClose(path: string) {
    this.props.onChange(_.omit(this.props.value, path));
  }

  handleSearch = () => {
    this.props.onChange(this.state.filters);
  };

  handleClear = () => {
    let { model, fields } = this.props;
    fields = fields || model.filterFields || '';

    let filters = _.assign({}, this.state.filters);

    _.map(fields.split(' '), (f, index) => {
      let [prefix] = f.split('?');
      let [path, view = ''] = prefix.split('@');
      if (view === 'search') {
        delete filters._search;
        return;
      }
      if (path) delete filters[path];
    });

    this.setState({ filters }, () => {
      this.props.onChange(this.state.filters);
    });
  };

  render() {
    let { model, fields } = this.props;
    fields = fields || model.filterFields || '';
    if (!fields) return null;
    let filters = this.state.filters || {};
    return (
      <Node
        className="filter-editor form-row align-items-center"
        wrapper="FilterEditor"
        props={this.props}
      >
        {
          _.map(fields.split(' '), (f, index) => {
            let [prefix, queryString] = f.split('?');
            let options = queryString ? qs.parse(queryString) : {};
            _.forEach(options, (v, k) => {
              if (v === '') {
                options[k] = true;
              }
            });
            let [path, view = ''] = prefix.split('@');
            if (view === 'flex') {
              return flex;
            }
            if (view === 'search') {
              return <SearchField
                key="@search"
                // @ts-ignore
                value={filters._search}
                placeholder={tr('Search...')}
                onChange={(v: any) => this.handleChange('_search', v)}
                onSearch={this.handleSearch}
              />;
            }
            let View: typeof FilterView;
            let field = model.fields[path];
            if (view && views.components.hasOwnProperty(view)) {
              View = views.components[view];
            } else if (field && field.filter) {
              View = views.components[field.filter];
            }
            if (!View) return null;
            let className = `${model.id}-${field.path}-filter field-filter`;
            let fieldCfg;
            if (field) {
              fieldCfg = _.assign({}, field, {
                label: tr(field.label, model.serviceId)
              });
            }

            return (
              <View
                key={path}
                className={className}
                model={model}
                field={fieldCfg}
                options={options}
                // @ts-ignore
                value={filters[path]}
                filters={filters}
                onChange={(v: any) => this.handleChange(path, v)}
                onSearch={this.handleSearch}
              />
            );
          })
        }

        <div className="flex-fill text-right">
          <button className="btn btn-success" onClick={this.handleSearch}>{tr('Search')}</button>
          <button className="btn btn-outline-secondary ml-1" onClick={this.handleClear}>{tr('Reset')}</button>
        </div>
      </Node>
    );
  }
}
