declare module 'alaska-email' {
  declare class EmailService extends Alaska$Service {
    driversOptions: Object[];
    defaultDriver: Object;
    driversMap: Object;
    nextTask: ?Alaska$Model$EmailTask;
  }

  declare var exports: EmailService;
}

declare class Alaska$Model$Email extends Alaska$Model {
  _id: string|number|Object|any;
  title: string;
  subject: string;
  driver: string;
  createdAt: Date;
  testTo: string;
  testData: Object;
  content: string;
}
declare module 'alaska-email/models/Email' {

  declare var exports: Class<Alaska$Model$Email>;
}

declare class Alaska$Model$EmailTask extends Alaska$Model {
  title: string;
  email: Alaska$Model$Email;
  state: number;
  interval: number;
  filters: Object;
  progress: number;
  total: number;
  lastUser: User;
  nextAt: Date;
  createdAt: Date;
}
declare module 'alaska-email/models/EmailTask' {

  declare var exports: Class<Alaska$Model$EmailTask>;
}
