// @flow

declare module 'alaska-sms' {
  declare class SmsService extends Alaska$Service {
  }
  declare var exports: SmsService;
}
declare module 'alaska-sms/models/Sms' {
  declare class Sms extends Alaska$Model {
    _id: string|Object|any;
    title: string;
    driver: Object;
    content: string;
    createdAt: Date;
    preSave():void;
  }
  declare var exports: Class<Sms>;
}
