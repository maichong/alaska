
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

  parse(value: any): null | moment.Moment {
    let v = moment(value);
    return v.isValid() ? v : null;
  }
}
