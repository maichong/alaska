declare module 'alaska-log' {
  declare class LogService extends Alaska$Service {
  }

  declare var exports: LogService;
}

declare module 'alaska-log/models/Log' {
  declare class Log extends Alaska$Model {
    title: string;
    type: string;
    level: string;
    method: string;
    time: number;
    status: string;
    length: number;
    details: Object;
    createdAt: Date;
  }

  declare var exports: Class<Log>;
}

declare module 'alaska-log/sleds/Create' {
  declare class Create extends Alaska$Sled {
  }

  declare var exports: Class<Create>;
}
