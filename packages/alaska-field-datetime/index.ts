
import { Field } from 'alaska-model';
import * as moment from 'moment';

export default class DatetimeField extends Field {
  static fieldName = 'Datetime';
  static plain = Date;
  static dbOptions = ['min', 'max', 'expires'];
  static viewOptions = ['min', 'max', 'format', 'dateFormat', 'timeFormat'];
  static defaultOptions = {
    format: 'YYYY-MM-DD HH:mm:ss',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    cell: 'DatetimeFieldCell',
    view: 'DatetimeFieldView',
    filter: 'DatetimeFieldFilter',
  };

  format: string;
  dateFormat: string;
  timeFormat: string;

  init() {
    let field = this;
    this.underscoreMethod('format', function (format?: string) {
      return moment(this.get(field.path)).format(format || field.format);
    });
  }

  parseFilter(value: any): any {
    let str = String(value);
    if (/^\d+$/.test(str)) {
      if (str.length === 4) {
        let date = moment(`${str}0201`);
        if (date.isValid()) {
          return {
            $gte: date.startOf('year').toISOString(),
            $lte: date.endOf('year').toISOString()
          };
        }
      }
      if (str.length === 6) {
        let date = moment(`${str}02`);
        if (date.isValid()) {
          return {
            $gte: date.startOf('month').toISOString(),
            $lte: date.endOf('month').toISOString()
          };
        }
      }
      if (str.length === 8) {
        let date = moment(str);
        if (date.isValid()) {
          return {
            $gte: date.startOf('day').toISOString(),
            $lte: date.endOf('day').toISOString()
          };
        }
      }
    }
    return this.parse(value);
  }

  parse(value: any): null | moment.Moment {
    let v = moment(value);
    return v.isValid() ? v : null;
  }
}
