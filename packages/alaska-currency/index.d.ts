import { Service } from 'alaska';
import Currency from './models/Currency';

export class CurrencyService extends Service {
  models: {
    Currency: typeof Currency;
  };

  currencies: Map<string, Currency>;
  defaultCurrency: Currency;
  defaultCurrencyId: string;
}

declare const currencyService: CurrencyService;

export default currencyService;
