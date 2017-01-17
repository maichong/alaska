import type { WriteStream } from 'fs';
import type Debugger from 'debug';
import type Router from 'koa-router';

declare type Indexed={
  [key:string]:any
}

type CookiesGetOptions = {
  signed?: boolean;
};

type CookiesSetOptions = {
  signed?: boolean;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
};


declare type Cookies = {
  get(name: string, options?: CookiesGetOptions):void;
  set(name: string, value?: string, options?: CookiesSetOptions):void;
}

declare type Alaska$Request = {
  header: Object;
  headers: Object;
  method: string;
  length: number|void;
  url: string;
  originalUrl: string;
  origin: string;
  href: string;
  path: string;
  querystring: string;
  search: string;
  host: string;
  hostname: string;
  body: Object,
  type: string;
  charset: string|void;
  query: Object;
  fresh: boolean;
  stale: boolean;
  protocol: string;
  secure: boolean;
  ip: string;
  ips: string[];
  subdomains: string[];
  idempotent: boolean;
  socket: Object;

  is(...types: string[]): boolean;
  accepts(...types: string[]): string[]|boolean;
  acceptsEncodings(...types: string[]): string[]|boolean;
  acceptsCharsets(...types: string[]): string[]|boolean;
  acceptsLanguages(...types: string[]): string[]|boolean;
  get(field: string): string;
};

declare type Alaska$Response = {
  header: Object;
  headers: Object;
  socket: Object;
  status: number|void;
  message: string|void;
  length: number|void;
  body: string|Buffer|WriteStream|Object|null;
  type: string;
  headerSent: boolean;
  lastModified: Date;
  etag: string;

  get(field: string): string;
  set(field: string, value: string|number|string[]):void;
  append(field: string, value: string):void;
  remove(field: string):void;
  is(...types: string[]): boolean;
  redirect(url: string, alt ?: string):void;
  attachment(filename?: string):void;
  vary(field: string):void;
};

declare type Alaska$Context = {
  req: Object;
  res: Object;
  request: Alaska$Request;
  response: Alaska$Response;
  state: Object;
  cookies: Cookies;
  header: { [key: string]: string };
  headers: { [key: string]: string };
  method: string;
  url: string;
  originalUrl: string;
  origin: string;
  href: string;
  path: string;
  querystring: string;
  search: string;
  host: string;
  hostname: string;
  query: { [key: string]: string };
  params:{ [key: string]: string },
  fresh: boolean;
  stale: boolean;
  protocol: string;
  secure: boolean;
  ip: string;
  ips: string[];
  subdomains: string[];
  socket: Object;
  body: string|Buffer|WriteStream|Object|null;
  status: number|void;
  message: string|void;
  length: number|void;
  type: string;
  headerSent: boolean;
  lastModified: Date;
  etag: string;

  throw(msg?: string, status?: number, properties?: Object):void;
  assert(value: any, msg?: string, status?: number, properties?: Object):void;
  is(...types: string[]): boolean;
  accepts(...types: string[]): string[]|boolean;
  acceptsEncodings(...types: string[]): string[]|boolean;
  acceptsCharsets(...types: string[]): string[]|boolean;
  acceptsLanguages(...types: string[]): string[]|boolean;
  get(field: string): string;
  set(field: string, value: string|number|string[]):void;
  append(field: string, value: string):void;
  remove(field: string):void;
  redirect(url: string, alt?: string):void;
  attachment(filename?: string):void;

  files:{ [name:string]:Object };
  alaska: Alaska$Alaska;
  main: Alaska$Service;
  service: Alaska$Service;
  locale: string;
  _locale: string;
  session:{ [key:string]:any };
  user?: User;
  checkAbility:(id: string) => Promise<void>;
  state:{
    c:Function;
    t:Function;
    env:string;
    [key:string]:any
  };
  panic:(message: string|number, code?: number) => void;
  error:(message: string|number, code?: number) => void;
  try: <T>(promise: Promise<T>) => Promise<T>;
  sendfile:(filePath: string, options: Object) => Promise<void>;
  t:((message: string, locale?: string, values?: Object) => string) &
    ((message: string, values: Object) => string);
  render:(template: string, state?: Object) => Promise<string>;
  show:(template: string, state?: Object) => Promise<string>;
  toJSON: () => Object;
};

declare type Alaska$Config$appMiddleware = {
  id:string;
  sort?: number;
  options?: Object;
};

declare type Alaska$Config$middleware = {
  id:string;
  path?:string;
  sort?: number;
  options?: Object;
  methods?:string[]
};

declare type Alaska$Config$cache={
  id:string;
  type:string;
  prefix?:boolean|string;
  maxAge?:number;
};

declare type Alaska$Config$renderer={
  type:string;
};

declare type Alaska$Config$session={
  cookie?:CookiesSetOptions;
  store?:Alaska$Config$cache;
};

declare type Alaska$Config$static = {
  prefix:string;
  root:string;
};

declare type Alaska$Config$services = {
  [id:string]:Object
};


declare type Alaska$Config = {
  [name:string]:any;

  // project
  name?: string;
  appMiddlewares?: Alaska$Config$appMiddleware[];
  port?:number;
  env?:string;
  session?:Alaska$Config$session;
  locales?:string[];
  defaultLocale?:string;
  localeQueryKey?:string;
  localeCookieKey?:string;

  // koa
  proxy?:boolean;
  subdomainOffset?:number;

  // service
  domain?: string;
  redirect?:string;
  prefix?:string|boolean;
  suffix?:string;
  defaultController?:string;
  defaultAction?:string;
  methods?:string[];
  statics?:Alaska$Config$static[];
  renderer?:Alaska$Config$renderer;
  templates?: string;
  services?:Alaska$Config$services;
  plugins?:{
    [key:string]:string|Class<Alaska$Plugin>
  };
  db?: false|string;
  dbPrefix?:false|string;
  cache?:Alaska$Config$cache|string;
  middlewares?:false|Alaska$Config$middleware[];
  controllers?:boolean;
  api?:boolean;
};

declare type Alaska$filter={
  value?:any;
  exact?:boolean;
  inverse?:boolean;
};

declare type Alaska$filters={
  [path:string]: Alaska$filter | null | string | boolean | number;
  $or?: Alaska$filters[]
};

declare type Alaska$Service$options = {
  id:string,
  dir:string,
  configFile?:string
};

declare class Alaska$Plugin {
}

declare class Alaska$Sled {
  constructor(params?: Object):void;
  run():Promise<any>;
  static run(params?: Object):Promise<any>;
}

declare type Alaska$Data={
  [key:string]:any;
  pick(...fields: string[]):Alaska$Data;
  omit(...fields: string[]):Alaska$Data;
  getRecord():Alaska$Model;
}

declare type Alaska$Model$relationships={
  [key:string]:{
    key?:string;
    ref:Class<Alaska$Model> | string;
    populations?:Alaska$Model$populations;
  };
};

declare type Alaska$Model$populations={
  [path:string]:{
    path?:string;
    match?:Object;
    filters?:Object;
    model?:Class<Alaska$Model>;
    //TODO check
    select?:string;
    scopes?:string;
    populations?:Alaska$Model$populations;
  }
};

declare class Alaska$Model extends events$EventEmitter {

[field:string]:any;

  // extends of Mongoose$Document
  schema:Mongoose$Schema;
  isNew:boolean;
  id:string;
  _id:string|number|Object|any;
  errors:Object[];

  constructor(obj?: Object, fields?: Object, skipId?: boolean):void;
  init(doc: Object, opts?: Object, fn?: Function):this;
  update(doc: Object, options: Object, fn: Function):Mongoose$Query;
  set(path: string|Object, val: any, type?: any, options?: Object):this;
  get(path: string, type?: any):any;
  markModified(path: string):void;
  unmarkModified(path: string):void;
  $ignore(path: string):void;
  modifiedPaths():string[];
  isModified(paths: string|string[]):boolean;
  $isDefault(path: string):boolean;
  isDirectModified(path: string):boolean;
  isInit(path: string):boolean;
  isSelected(path: string):boolean;
  validate(options: Object, callback?: Function):Promise<void>;
  validateSync(options: Object):Mongoose$MongooseError|void;
  invalidate(path: string, err: string|Error, val: any, kind?: string):Mongoose$ValidationError;
  toObject(options?: Object):Object;
  toJSON(options?: Object):Object;
  inspect(options?: Object):Object;
  toString():string;
  equals(doc: Mongoose$Document):boolean;
  populate(path?: Object|string, fn?: Function):this;
  execPopulate():Promise<Mongoose$Document>;
  populated(path: string, val?: any, options?: Object):string|void;
  depopulate(path: string):void;

  // Mongoose$Model

  db:Mongoose$Connection;
  collection:Mongoose$Collection;
  modelName:string;
  baseModelName:string;
  base:Mongoose;
  discriminators:Alaska$Model[];

  static remove(conditions: Object, callback?: Function):Mongoose$Query;
  static find(conditions?: Object, projection?: Object, options?: Object, callback?: Function):Mongoose$Query & Promise<Alaska$Model[]>;
  static findById(id: Object|string|number, projection?: Object, options?: Object, callback?: Function):Mongoose$Query|Promise<Alaska$Model>;
  static findByIdAndUpdate(id: Object|string|number, update: Object, options?: Object, callback?: Function):Mongoose$Query;
  static findByIdAndRemove(id: Object|string|number, options?: Object, callback?: Function):Mongoose$Query;
  static findOne(conditions?: Object, projection?: Object, options?: Object, callback?: Function):Mongoose$Query|Promise<Alaska$Model>;
  static findOneAndUpdate(conditions: Object, update: Object, options?: Object, callback?: Function):Mongoose$Query;
  static findOneAndRemove(conditions: Object, options?: Object, callback?: Function):Mongoose$Query;
  static update(conditions: Object, doc: Object, options?: Object, callback?: Function):Mongoose$Query;
  static count(conditions?: Object, callback?: Function):Promise<number>;
  static distinct(field: string, conditions?: Object, callback?: Function):Mongoose$Query|Promise<any[]>;
  static where(path: string|Object, val?: any):Mongoose$Query;
  static $where(js: string|Function):Mongoose$Query;
  static create(doc: Object, fn?: Function):Promise<void>;
  static create(doc: Object[], fn?: Function):Promise<void>;
  static create(...doc: Array<Object|Function>):Promise<void>;
  static insertMany(doc: Object, fn?: Function):Promise<void>;
  static insertMany(doc: Object[], fn?: Function):Promise<void>;
  static insertMany(...doc: Array<Object|Function>):Promise<void>;
  static hydrate(obj: Object):Alaska$Model;
  static mapReduce(o: Object, callback?: Function):Promise<Alaska$Model>;
  static geoNear(near: Object|number[], callback?: Function):Promise<Alaska$Model>;
  static geoSearch(conditions: Object, options?: Object, callback?: Function):Promise<Alaska$Model>;
  static aggregate(options?: Object, fn?: Function):Mongoose$Aggregate|Promise<Alaska$Model>;
  static populate(docs: Mongoose$Document|Array<Mongoose$Document>, paths: Object, callback?: Function):Promise<Alaska$Model>;

  constructor(obj: Object, fields?: Object, skipId?: boolean):void;
  save(options?: Object, fn?: Function):Promise<void>;
  increment():this;
  remove(options?: Object, fn?: Function):Promise<void>;
  model(name: string):Class<Alaska$Model>;
  discriminator(name: string, schema: Mongoose$Schema):Class<Alaska$Model>;
  ensureIndexes(options?: Object, fn?: Function):Promise<void>;

  // Alaska$Model

  _:{ [path:string]:Function };
  data(scope?: string):Alaska$Data;

  static _pre: {
    [action:string]:Function[]
  };
  static _post: {
    [action:string]:Function[]
  };
  static _underscore: {
    [field:string]:{
      [name:string]:Function
    }
  };
  static __methods: {
    [field:string]:{
      [name:string]:Function
    }
  };
  static _virtuals:{ [path:string]:boolean };

  static classOfModel:true;
  static registered:boolean;
  static name:string;
  static id:string;
  static key:string;
  static path:string;
  static label:string;
  static icon:string;
  static nocreate:boolean;
  static noedit:boolean;
  static noremove:boolean;
  static groups:{ [key:string]: string| { title:string;panle?:boolean;className?:string } };
  static service:Alaska$Service;
  static db:Mongoose$Connection;
  static MongooseModel:Mongoose$Model;
  static schema:Mongoose$Schema;
  static prefix:string;
  static autoSelect:boolean;
  static defaultScope:{ [field:string]:boolean };
  static defaultSort?:string;
  static titleField:string;
  static userField:string;
  static searchFields:string[] | string;
  static defaultColumns:string[] | string;
  static defaultFilters?:Object | (ctx: Alaska$Context) => Alaska$filters;
  static scopes:{
    [scope:string]:string | { [field:string]:boolean }
  };
  static fields:{
    [path:string]:Alaska$Field$options | Alaska$Field
  };
  static virtuals:{};
  static api:{
    list?: number,
    show?: number,
    count?: number,
    create?: number,
    update?: number,
    remove?: number
    //TODO akita
  };
  static actions:{
    [key:string]:{
      title?:string;
      style?:string;
      sled:string;
      depends?:Alaska$Field$depends;
      pre?:Alaska$Field$depends;
      post?:Alaska$Field$depends;
    }
  };

  static relationships:Alaska$Model$relationships;
  static populations:Alaska$Model$populations;

  static pre(action: string, fn: Function): void;
  static post(action: string, fn: Function): void;
  static register():void;
  static underscoreMethod(field: string, name: string, fn: Function):void;
  static createFilters(search: string, filters?: Object|string): Alaska$filters;
  static paginate(options: Object): Mongoose$Query & Promise<Alaska$ListResult>;
  static list(ctx: Alaska$Context, state?: Object): Promise<Alaska$ListResult>;
  static show(ctx: Alaska$Context, state?: Object): Promise<Alaska$Model>;
  static fromObject(data: Object): Alaska$Model;
  static fromObjectArray(array: Object[]): Alaska$Model[];
  static toObjectArray(array: Alaska$Model[]): Object[];
}

declare type Alaska$ListResult = {
  page:number;
  perPage:number;
  total:number;
  totalPage:number;
  next:number;
  previous:number;
  results:Alaska$Model[]
};

declare class Alaska$Field {
  static classOfField:true;
  static plain:any;
  static options:string[]|Object[];
  static viewOptions:string[];
  static views:{
    cell?:Alaska$Field$View;
    view?:Alaska$Field$View;
    filter?:Alaska$Field$View;
  };
[path:string]:any;

  // Mongoose
  get:void|Function;
  set:void|Function;
  default:void|any;
  index:void|boolean;
  unique:void|boolean;
  sparse:void|boolean;
  text:void|boolean;
  required:void|boolean;
  select:void|boolean;

  // Alaska
  Class:Class<Alaska$Field>;
  type?: Class<Alaska$Field> | string | Function | void;
  label:void|string;
  path:void|string;
  group:void|string;
  hidden:void|boolean;
  fixed:void|boolean;
  horizontal:void|boolean;
  nolabel:void|boolean;
  disabled:void|boolean | Alaska$Field$depends | string;
  super:void|boolean;
  help:void|string;
  cell:void|string|boolean;
  view:void|string;
  filter:void|string|boolean;
  depends:void|Alaska$Field$depends;
  private:boolean;
  _model:Class<Alaska$Model>;
  _schema: Mongoose$Schema;

  viewOptions():{ label:string;plain:Object|string };
  init():void;
  createFilter(filter: Object, filters: Object): any | void;
}

declare type Alaska$Field$options={
  // Mongoose
  get?:Function;
  set?:Function;
  default?:any;
  index?:boolean;
  unique?:boolean;
  sparse?:boolean;
  text?:boolean;
  required?:boolean;
  select?:boolean;

  // Alaska
  type?: Class<Alaska$Field> | string | Function | void;
  ref?: Class<Alaska$Model> | string | [string];
  label?:string;
  path?:string;
  group?:string;
  multi?:boolean;
  hidden?:boolean;
  fixed?:boolean;
  horizontal?:boolean;
  nolabel?:boolean;
  disabled?:boolean | Alaska$Field$depends | string;
  super?:boolean;
  help?:string;
  cell?:string|boolean;
  view?:string;
  filter?:string|boolean;
  depends?:Alaska$Field$depends;
};

declare type Alaska$Field$View= {
  name:string;
  path:string;
};

declare type Alaska$Field$depends= {
  [path:string]:any
};

declare class Alaska$Service {
  id:string;
  dir:string;
  version: string;
  alaska: Alaska$Alaska;
  debug: Debugger;
  options: Alaska$Service$options;
  router: Router;
  cache: Alaska$CacheDriver;
  renderer: Alaska$Renderer;
  db: Mongoose$Connection;
  sleds:{ [name:string]:Class<Alaska$Sled> };
  models:{ [name:string]:Class<Alaska$Model> };
  locales: { [locale:string]:Object };

  constructor(options?: Alaska$Service$options):void;
  pre(action: string, fn: Function): void;
  post(action: string, fn: Function): void;
  panic:(message: string|number, code?: number) => void;
  error:(message: string|number, code?: number) => void;
  try: <T>(promise: Promise<T>) => Promise<T>;
  adminSettings?:(ctx: Alaska$Context, user: User, result: Object) => Promise <void>;
  applyConfig(config: Alaska$Config): void;
  config(key: string, defaultValue?: any, mainAsDefault?: boolean): any;
  model(name: string, optional?: boolean): Class<Alaska$Model>;
  sled(name: string): Class<Alaska$Sled>;
  run(name: string, params?: Object): Promise<any>;
  t(message: string, locale?: string, values?: Object, formats?: Object): string;
  toJSON():Object;
  loadModels():void;
}

declare class Alaska$Alaska {
  db: Mongoose$Connection;
  main:Alaska$Service;
  services:{ [id:string]:Alaska$Service };
  service(id: string):Alaska$Service;
  config(key: string, defaultValue: any): any;
  toJSON():Object;
  panic:(message: string|number, code?: number) => void;
  error:(message: string|number, code?: number) => void;
  try: <T>(promise: Promise<T>) => Promise<T>;
}

declare class Alaska$Driver {
  options:Object;
  idle:number;
  idleId:string;

  free():void;
  destroy():void;
}

declare class Alaska$CacheDriver extends Alaska$Driver {
  get(key: string): Promise<any>;
  set(key: string, value: any, lifetime?: number): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  inc(key: string): Promise<number>;
  dec(key: string): Promise<number>;
  size(): Promise<number>;
  prune(): Promise<void>;
  flush(): Promise<void>;
}

declare class Alaska$Renderer {
  constructor(service: Alaska$Service, options: Alaska$Config$renderer):void;
  renderFile(template: string, state: Object, callback: Function):void;
}

declare class Alaska$NormalError extends Error {
}

declare module alaska {
  declare export var NormalError: Class<Alaska$NormalError>;
  declare export var Alaska: Class<Alaska$Alaska>;
  declare export var Service: Class<Alaska$Service>;
  declare export var Model: Class<Alaska$Model>;
  declare export var Sled: Class<Alaska$Sled>;
  declare export var Field: Class<Alaska$Field>;
  declare export var Plugin: Class<Alaska$Plugin>;
  declare export var utils: Object;
  declare var exports: Alaska$Alaska;
  declare export default Alaska$Alaska;
}
