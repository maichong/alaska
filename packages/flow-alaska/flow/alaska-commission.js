declare module 'alaska-commission' {
  declare class CommissionService extends Alaska$Service {
    constructor(options?: Alaska$Service$options, mAlaska?: Alaska$Alaska): void;
    postLoadConfig(): void;
  }

  declare var exports: CommissionService;
}

declare module 'alaska-commission/models/Commission' {
  declare class Commission extends Alaska$Model {
    title: string;
    user: Object;
    contributor: Object;
    order: Object;
    main: Object;
    level: number;
    currency: Object;
    amount: number;
    state: number;
    error: string;
    createdAt: Date;
    balancedAt: Date;
  }

  declare var exports: Class<Commission>;
}

declare module 'alaska-commission/sleds/Balance' {
  declare class Balance extends Alaska$Sled {
  }

  declare var exports: Class<Balance>;
}

declare module 'alaska-commission/sleds/Create' {
  declare class Create extends Alaska$Sled {
  }

  declare var exports: Class<Create>;
}
