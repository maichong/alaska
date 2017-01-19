declare type Alaska$SelectField$option={
  value:number|string|boolean;
  label:string;
  style?:Alaska$style;
  depends?:Alaska$Field$depends;
  unit?:any;
  precision?:number;
};

declare module 'alaska-field-select' {
  declare class SelectField extends Alaska$Field {
    number?:boolean;
    boolean:boolean;
    options:Alaska$SelectField$option[]
  }

  declare var exports: Class <SelectField>;
}

declare module 'alaska-field-select/views/Select' {
  declare var exports: Class<React$Component<void, Object, void>>;
}

declare module 'alaska-field-select/views/Checkbox' {
  declare var exports: Class<React$Component<void, Object, void>>;
}

declare module 'alaska-field-select/views/Switch' {
  declare var exports: Class<React$Component<void, Object, void>>;
}
