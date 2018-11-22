import { Field } from 'alaska-model';
import * as moment from 'moment';

export default class DateField extends Field {
  static fieldName = 'Date';
  static plain = Date;
  static dbOptions = ['min', 'max', 'expires'];
  static viewOptions = ['min', 'max', 'format'];
  static defaultOptions = {
    format: 'YYYY-MM-DD',
    cell: 'DateFieldCell',
    view: 'DateFieldView',
    filter: 'DatetimeFieldFilter',
  };

  format: string;

  init() {
    let field = this;
    this.underscoreMethod('format', function (format: any) {
      return moment(this.get(field.path)).format(format || field.format);
    });
  }

  parse(value: any): null | moment.Moment {
    let v = moment(value);
    return v.isValid() ? v : null;
  }
}
