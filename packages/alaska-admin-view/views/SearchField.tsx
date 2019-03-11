import * as React from 'react';
import Node from './Node';
import { SearchFieldProps } from '..';

export default function SearchField(props: SearchFieldProps) {
  let { value, onChange, onSearch, placeholder } = props;

  return (
    <Node className="search-field" wrapper="SearchField" props={props}>
      <input
        className="form-control"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
        placeholder={placeholder}
      />
    </Node>
  );
}
