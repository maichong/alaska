declare module 'alaska-sms-test' {
  declare class SmsTestDriver {
    constructor(service: Alaska$Service): void;
    service: Alaska$Service;
    send(to: string, message: string): Promise<void>;
  }

  declare var exports: Class<SmsTestDriver>;
}
