import * as numeral from 'numeral';
import * as _ from 'lodash';
import { ValueParser } from '..';

export const count: ValueParser<number> = ({ slice }) => {
  if (!slice.value) {
    slice.value = 0;
  }
  slice.value += 1;
};

export const sum: ValueParser<number> = ({ record, valueField, slice }) => {
  if (!slice.value) {
    slice.value = 0;
  }
  slice.value += numeral(record.get(valueField)).value() || 0;
};

export const average: ValueParser<number, { total: number; count: number }>
  = ({ record, valueField, slice, series }) => {
    if (!slice.value) {
      slice.value = 0;
    }
    if (!slice.total) {
      slice.total = 0;
    }
    if (!slice.count) {
      slice.count = 0;
    }
    slice.count += 1;
    let value = numeral(record.get(valueField)).value() || 0;
    if (value) {
      slice.total += value;
    }
    slice.value = _.round(slice.total / slice.count, series.precision);
  };

export const min: ValueParser<number> = ({ record, valueField, slice }) => {
  slice.value = Math.min(slice.value || 0, numeral(record.get(valueField)).value() || 0);
};

export const max: ValueParser<number> = ({ record, valueField, slice }) => {
  slice.value = Math.max(slice.value || 0, numeral(record.get(valueField)).value() || 0);
};
