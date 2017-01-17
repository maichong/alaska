declare module 'alaska-balance' {
  declare class BalanceService extends Alaska$Service {
    _currencies:?Object[];
    _defaultCurrency:Object;
    currencies():Object[];
    currenciesMap():Object;
    defaultCurrency():Object;
  }

  declare var exports: BalanceService;
}

declare module 'alaska-balance/models/Income' {
  declare class Income extends Alaska$Model {
    title: string;
    user: User;
    type: string;
    currency: string;
    amount: number;
    balance: number;
    createdAt: Date;
  }

  declare var exports: Class<Income>;
}

declare module 'alaska-balance/models/Withdraw' {
  declare class Withdraw extends Alaska$Model {
    title: string;
    user: User;
    currency: string;
    amount: number;
    note: string;
    createdAt: Date;
    state: number;
    reason: string;
  }

  declare var exports: Class<Withdraw>;
}
