declare module 'alaska-balance' {
  declare class BalanceService extends Alaska$Service {
    currencies: Alaska$SelectField$option[];
    currenciesMap: Object;
    defaultCurrency: Alaska$SelectField$option;
    getCurrenciesAsync(): Promise<Alaska$SelectField$option[]>;
    getDefaultCurrencyAsync(): Promise<Alaska$SelectField$option>;
  }

  declare var exports: BalanceService;
}

declare class Alasak$Model$Income extends Alaska$Model {
  title: string;
  user: User;
  deposit: Alasak$Model$Deposit;
  type: string;
  currency: string;
  amount: number;
  balance: number;
  createdAt: Date;
}

declare module 'alaska-balance/models/Income' {
  declare var exports: Class<Alasak$Model$Income>;
}

declare class Alasak$Model$Deposit extends Alaska$Model {
  title: string;
  user: User;
  currency: string;
  amount: number;
  balance: number;
  createdAt: Date;
  expiredAt: Date;
}

declare module 'alaska-balance/models/Deposit' {
  declare var exports: Class<Alasak$Model$Deposit>;
}

declare class Alaska$Model$Withdraw extends Alaska$Model {
  title: string;
  user: User;
  currency: string;
  amount: number;
  note: string;
  createdAt: Date;
  state: number;
  reason: string;
}

declare module 'alaska-balance/models/Withdraw' {
  declare var exports: Class<Alaska$Model$Withdraw>;
}
