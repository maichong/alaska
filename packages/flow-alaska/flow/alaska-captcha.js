declare module 'alaska-captcha' {
  declare class CaptchaService extends Alaska$Service {
    constructor(options?: Alaska$Service$options, mAlaska?: Alaska$Alaska):void;
    preLoadModels():void;
    middleware(toPath: ?string):Function;
  }
  declare var exports: CaptchaService;
}

declare module 'alaska-captcha/models/Captcha' {
  declare class Captcha extends Alaska$Model {
    _id: string|number|Object|any;
    title: string;
    type: string;
    numbers: string;
    letters: string;
    length: number;
    lifetime: number;
    createdAt: Date;
  }
  declare var exports: Class<Captcha>;
}

declare module 'alaska-captcha/sleds/Send' {
  declare class Send extends Alaska$Sled {

  }
  declare var exports: Class<Send>;
}

declare module 'alaska-captcha/sleds/Verify' {
  declare class Verify extends Alaska$Sled {

  }
  declare var exports: Class<Verify>;
}
