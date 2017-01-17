declare type Alaska$SelectField$option={
  value:number|string|boolean;
  label:string;
  style?:Alaska$style;
  depends?:Alaska$Field$depends
};

declare module 'alaska-field-select' {
  declare class SelectField extends Alaska$Field {
    number?:boolean;
    boolean:boolean;
    options:Alaska$SelectField$option[]
  }

  declare var exports: Class <SelectField>;
}
