declare module 'alaska-field-text' {
  declare class TextField extends Alaska$Field {
    trim: boolean;
    match: RegExp;
    lowercase: boolean;
    uppercase: boolean;
    maxlength: number;
    minlength: number;
  }

  declare var exports: Class<TextField>;
}
