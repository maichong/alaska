import Email from 'alaska-email/models/Email';
import EmailTask from 'alaska-email/models/EmailTask';

declare module 'alaska-email' {
  declare class EmailService extends Alaska$Service {
    driversOptions: Object[];
    defaultDriver: Object;
    driversMap: Object;
    nextTask: ?EmailTask;
  }

  declare var exports: EmailService;
}

declare module 'alaska-email/models/Email' {
  declare class Email extends Alaska$Model {
    _id: string|number|Object|any;
    title: string;
    subject: string;
    driver: string;
    createdAt: Date;
    testTo: string;
    testData: Object;
    content: string;
  }

  declare var exports: Class<Email>;
}

declare module 'alaska-email/models/EmailTask' {
  declare class EmailTask extends Alaska$Model {
    title: string;
    email: Email;
    state: number;
    interval: number;
    filters: Object;
    progress: number;
    total: number;
    lastUser: User;
    nextAt: Date;
    createdAt: Date;
  }

  declare var exports: Class<EmailTask>;
}
