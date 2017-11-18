declare type Alaska$view$Field$Cell$Props = {
  +model: Alaska$view$Model,
  +field: Alaska$view$Field,
  +value: any
}

declare type Alaska$view$Field$Filter$Props = {
  +className: string,
  +value: any,
  +field: Alaska$view$Field,
  +onChange: Function,
  +onClose: Function,
}

declare type  Alaska$view$Field$View$Props = {
  +className: string,
  +model: Alaska$view$Model,
  +field: Alaska$view$Field,
  +record: Object,
  +errorText: string,
  +disabled: boolean,
  +value: any,
  +onChange: Function,
}

declare type Alaska$view$Login = {
  +errorMsg: '',
  +show: boolean
}

declare type Alaska$view$User = {
  +access: boolean,
  +id: string,
  +username: string,
  +displayName: string,
  +avatar: string,
  +createdAt: string
}

declare type Alaska$view$Field = {
  +label: string,
  +path: string,
  +required: boolean,
  +cell: string,
  +view: string,
  +filter: string,
  +service: string,
  +model: string,
  +plain: string,
  +default?: any,
  +group?: string,
  +hidden?: boolean,
  +super?: boolean,
  +depends?: Alaska$Field$depends,
  +disabled?: boolean | Alaska$Field$depends | string,
  +help?: string,

  // layout
  +fixed?: boolean,
  +horizontal?: boolean,
  +nolabel?: boolean,
  // fields
  // relationship
  +filters?: Object,
  +ref?: string,
  // select
  +options?: Alaska$SelectField$option[],
  +multi?: boolean,
  +after?: string,
  // date
  +format?: string,
  +cellFormat?: string,
  +dateFormat?: string,
  +timeFormat?: string,
  // number
  +max?: number,
  +min?: number,
  // balance
  +unit?: string,
  +size?: number,
  +precision?: number,
  // image
  +allowed?: string[],
  +target?: string,
  +thumbSuffix?: string,
  +defaultImage?: string,
  +upload?: {
    service: string,
    model: string,
    path: string,
    leaveConfirm: string
  },
}

declare type Alaska$view$Model = {
  +name: string, // User
  +id: string, // user
  +path: string, // alaska-user.User
  +key: string, // alaska-user.user
  +label: string,
  +serviceId: string,
  +titleField: string,
  +defaultSort: string,
  +defaultColumns: string[],
  +searchFields: string[],
  +groups: {
    [key: string]: Alaska$FieldGroup
  },
  +relationships: Alaska$Model$relationships,
  +actions: Alaska$Model$actions,
  +fields: {
    [path: string]: Alaska$view$Field
  },
  +abilities: {
    [ability: string]: true
  }
}

declare type Alaska$view$Service = {
  id: string, // alaska-user
  prefix: string,
  api: boolean,
  models: {
    [modelName: string]: Alaska$view$Model
  }
}

declare type Alaska$view$Record = {
  _id: any,
  [field: string]: any
}

declare type Alaska$view$RecordList = {
  +key: string,
  +total: number,
  +page: number,
  +limit: number,
  +totalPage: number,
  +previous: number,
  +next: number,
  +error: string,
  +results: Array<Alaska$view$Record>
}

declare type Alaska$view$Menu = {
  +id: string,
  +label: string,
  +icon: string,
  +type: string,
  +link: string,
  +service: string,
  +sort: number,
  +activated: boolean
}

declare type Alaska$view$Settings = {
  +superMode: boolean,
  +abilities: {
    [ability: string]: true
  },
  +currencies: {
    [cur: string]: {}
  },
  +services: {
    [serviceId: string]: Alaska$view$Service
  },
  +models: {
    [key: string]: Alaska$view$Model
  },
  +locale: string,
  +locales: {
    [serviceId: string]: {
      [local: string]: {
        [key: string]: string
      }
    }
  },
  +menu: Alaska$view$Menu[],
}

declare type Alaska$view$details = {
  [modelKey: string]: {
    [id: string]: Alaska$view$Record
  }
}

declare type Alaska$view$lists = {
  [key: string]: Alaska$view$RecordList
}

declare type Alaska$view$save = {
  +error?: Error,
  +fetching: boolean,
  +key: string,
  +_r: number,
  +res: Alaska$view$Record
}

declare type Alaska$view$StoreState = {
  +layout: 'full' | 'icon',
  +login: Alaska$view$Login,
  +user: Alaska$view$User,
  +settings: Alaska$view$Settings,
  +lists: Alaska$view$lists,
  +details: Alaska$view$details,
  +save: Alaska$view$save
}

declare type Alaska$view$Views = {
  [name: string]: React$Component<any, any>,
  wrappers: {
    [name: string]: Array<React$Component<any, any>>
  },
  routes: Array<{
    component: Array<React$Component<any, any>>,
    path: string,
  }>,
  navs: Array<React$Component<any, any>>
}

declare module 'alaska-admin-view' {
  declare export var api: Akita$Client;
  declare export var store: Object;
  declare export var App: Class<React$Component<Object, Object>>;
}
declare module 'alaska-admin-view/redux/details' {
  declare var exports: any;
}

declare module 'alaska-admin-view/redux/lists' {
  declare var exports: any;
}

declare module 'alaska-admin-view/redux/layout' {
  declare var exports: any;
}

declare module 'alaska-admin-view/redux/login' {
  declare var exports: any;
}

declare module 'alaska-admin-view/redux/save' {
  declare var exports: any;
}

declare module 'alaska-admin-view/redux/settings' {
  declare var exports: any;
}

declare module 'alaska-admin-view/redux/startup' {
  declare var exports: any;
}

declare module 'alaska-admin-view/redux/user' {
  declare var exports: any;
}

declare module 'alaska-admin-view/views/FilterEditor' {
  declare var exports: Class<React$Component<Object, Object>>;
}
