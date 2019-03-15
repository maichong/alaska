import { Service } from 'alaska';
import Currency from './models/Currency';

class CurrencyService extends Service {
  _currency?: Currency;
  currencies: Map<string, Currency> = new Map();

  get defaultCurrency(): Currency {
    if (!this._currency) throw new Error('Default currency not initialized!');
    return this._currency;
  }

  get defaultCurrencyId(): string {
    if (!this._currency) throw new Error('Default currency not initialized!');
    return this._currency.id;
  }

  postInit() {
    Currency.find().then((list: Currency[]) => {
      list.forEach((record) => {
        this.currencies.set(record.id, record);
      });
    });

    Currency.getWatcher().on('change', (record: Currency) => {
      this.currencies.set(record.id, record);
    });
  }
}

export default new CurrencyService({
  id: 'alaska-currency'
});
