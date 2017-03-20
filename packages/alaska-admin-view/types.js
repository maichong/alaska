export type Field = {
  path:string;
  label:string;
  cell:string;
  view:string;
  filter:string;
  required:boolean;
  plain:string;
  disabled?:Alaska$Field$depends;
  depends?:Alaska$Field$depends;
};
export type Group = {
  label:string;
  panel?:boolean;
  className?:string;
};
export type Action = {
  title?:string;
  tooltip?:string;
  style?:string;
  sled?:string;
  view?:string;
  super?:boolean;
  editor?:boolean;
  list?:boolean;
  needRecords?:number;
  disabled?:Alaska$Field$depends;
  depends?:Alaska$Field$depends;
  pre?:Alaska$Field$depends;
  post?:Alaska$Field$depends;
};
export type Relationship = {
  key:string;
  model:string;
  service:string;
  path:string;
  title:string
};
export type Model = {
  id:string;
  name:string;
  key:string;
  path:string;
  label:string;
  serviceId:string;
  titleField:string;
  abilities:{
    [action:string]:boolean
  },
  actions:{
    [key:string]:Action
  },
  searchField:string[];
  defaultColumns:string[];
  defaultSort:string;
  fields:{
    [path:string]:Field
  },
  groups:{
    [key:string]:Group
  },
  relationships:{
    [key:string]:Relationship
  }
};

export type Service ={
  api:boolean;
  id:string;
  models:{
    [name:string]:Model
  };
  prefix:'string'
};
export type Settings = {
  abilities:{
    [ability:string]:boolean,
    icon:string;
    logo:string;
    locale:string;
    locales:{
      [service:string]:{
        [locale:string]:{
          [str:string]:string
        }
      }
    },
    menu:Array<{
      id:string;
      link:string;
      icon:string;
      service:string;
      sort:number;
      type:'link' | 'group';
      activated:boolean
    }>,
    models:{
      [path:string]:Model
    },
    service:{
      [id:string]:Service
    },
    superMode:boolean
  }
};
export type User = {
  id:string;
  access:boolean;
  avatar:string;
  displayName:string;
  username:string;
  email:string;
};
export type Record = {
  _id: any;
  [field:string]:any
};
export type List = {
  error:null | string;
  limit:number;
  next:number;
  previous:number;
  page:number;
  total:number;
  totalPage:number;
  results:Record[]
};
export type Lists={
  [modelKey:string]:List
};
export type Details = {
  [modelKey:string]:{
    [id:string]:Record
  }
}
export type Views = {
  [name:string]:React$Component<any,any,any>;
  wrappers:{
    [name:string]:Array<React$Component<any,any,any>>
  };
  routes:Array<{
    component:Array<React$Component<any,any,any>;
    path:string;
  }>;
  navs:Array<React$Component<any,any,any>>
}
