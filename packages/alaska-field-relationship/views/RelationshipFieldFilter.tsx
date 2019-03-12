
import * as React from 'react';
import Select from '@samoyed/select';
import { SelectOption } from '@samoyed/types';
import { FilterViewProps } from 'alaska-admin-view';
import relationQuery from 'alaska-admin-view/utils/query';
import * as _ from 'lodash';

function getFilters(filters?: Object) {
  if (!filters) return {};
  return _.reduce(filters, (res: any, value, key) => {
    if (!_.isString(value) || value[0] !== ':') {
      res[key] = value;
    }
    return res;
  }, {});
}

interface FilterState {
  selectOptions: SelectOption[];
}

export default class RelationshipFieldFilter extends React.Component<FilterViewProps, FilterState> {
  constructor(props: FilterViewProps) {
    super(props);
    this.state = {
      selectOptions: []
    };
  }

  componentDidMount() {
    this.handleSearch('');
  }

  handleSearch = (keyword: string) => {
    let { field } = this.props;
    const ref: string = field.model;
    if (!ref) return;
    relationQuery({
      model: field.model,
      search: keyword,
      filters: getFilters(field.filters)
    }).then((res) => {
      let selectOptions = _.map(res.results || [], (val) => ({
        label: val[field.modelTitleField] || val.title || val._id,
        value: val._id
      }));
      this.setState({ selectOptions });
    });
  };

  render() {
    let { className, field, value, options, onChange } = this.props;
    const { selectOptions } = this.state;

    let style: any = {
      maxWidth: options.maxWidth || '240px'
    };

    if (options.width) {
      style.width = options.width;
    } else {
      className += ` col-${options.col || 3}`;
    }

    let el = <Select
      className="select flex-1"
      options={selectOptions}
      onInputChange={this.handleSearch}
      // @ts-ignore
      value={value}
      onChange={(v) => onChange(v || undefined)}
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
      <div style={style} className={`${className} relationship-field-filter ${options.className || ''}`}>
        {el}
      </div>
    );
  }
}
