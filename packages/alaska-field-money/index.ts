import * as _ from 'lodash';
import * as numeral from 'numeral';
import { Model } from 'alaska-model';
import { CurrencyService } from 'alaska-currency';
import NumberField from 'alaska-field-number';

export default class MoneyField extends NumberField {
  static defaultOptions = {
    cell: 'NumberFieldCell',
    view: 'NumberFieldView',
    filter: 'NumberFieldFilter',
    format: '0,0.00',
    default: 0,
  };

  init() {
    const field = this;
    const currencyService = field._model.service.lookup('alaska-currency') as CurrencyService;
    if (!currencyService) {
      // 没有安装货币服务
      NumberField.prototype.init.call(this);
      return;
    }

    field.underscoreMethod('format', function (format: string) {
      if (format) {
        return numeral(this.get(field.path)).format(format);
      }
      return this.get(field.path);
    });

    this._schema.pre('save', function (next: Function) {
      // @ts-ignore
      const record: Model = this;

      if (!record.isModified(field.path)) {
        next();
        return;
      }

      const value = record.get(field.path);

      let currencyField = field.currencyField || 'currency';
      let currencyId = record.get(currencyField) || field.currency;
      let precision = field.precision;
      let currency = currencyService.currencies.get(currencyId);
      if (currency) {
        precision = currency.precision;
      }
      if (typeof precision === 'number') {
        let newValue = _.round(value, precision);
        record.set(field.path, newValue);
      }
      next();
    });
  }
}
