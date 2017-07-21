import type { WriteStream } from 'fs';
import type Debugger from 'debug';
import type Router from 'koa-router';
import Koa from 'koa';

declare type Indexed = {
  [key:string]:any
}

declare type Alaska$style= 'default' | 'primary' | 'success' | 'warning' | 'info' | 'danger';

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
  get(name: string, options?: CookiesGetOptions):string|void;
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

  sessionKey:string;
  sessionId:string;
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
  cache:boolean;
};

declare type Alaska$Config$session={
  cookie?: {
    signed?: boolean;
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    key?:string;
    get?:(ctx: Alaska$Context, key: string, cookieOpts: Object) => string;
    set?:(ctx: Alaska$Context, key: string, sid: string, cookieOpts: Object) => void;
  };
  store?:Alaska$Config$cache;
  ignore?:RegExp|string|Array<RegExp|string>
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

declare type Alaska$sledQueueItem={
  id:string;
  key:string;
  notify:boolean;
  params:Object;
  name: string;
  result: void|any;
  error: void|string;
  timeout: number;
  createdAt: Date;
  expiredAt: Date;
}

declare class Alaska$Sled {
  static classOfSled: true;
  static service:Alaska$Service;
  static name:string;
  static key:string;
  static config:Object;
  static run(params?: Object):Promise<any>;
  static createSubscribeDriver():Alaska$SubscribeDriver;
  static pre(fn: Function):void;
  static post(fn: Function):void;
  static read(timeout?: number): Promise<Alaska$Sled|null>;
  static createQueueDriver():Alaska$QueueDriver;

  service:Alaska$Service;
  name:string;
  key:string;
  config:Object;
  constructor(params?: Object):void;
  run():Promise<any>;
  createQueueDriver():Alaska$QueueDriver;
  createSubscribeDriver():Alaska$SubscribeDriver;
  send(timeout?: number, notify?: boolean):Promise<void>;
  wait(waitTimeout?: number, sledTimeout?: number): Promise<any>;
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
    path: string,
    title?: string,
    private?: boolean,
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
  update(doc: Object, options: Object, fn: Function):Alaska$Query;
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

  // Alaska$Model

  db:Mongoose$Connection;
  collection:Mongoose$Collection;
  modelName:string;
  baseModelName:string;
  base:Mongoose;
  discriminators:Alaska$Model[];

  static remove(conditions: Object, callback?: Function):Alaska$Query;
  static find(conditions?: Object, projection?: Object, options?: Object, callback?: Function):Alaska$Query & Promise<Alaska$Model[]>;
  static findById(id: Object|string|number, projection?: Object, options?: Object, callback?: Function):Alaska$Query|Promise<Alaska$Model>;
  static findByIdAndUpdate(id: Object|string|number, update: Object, options?: Object, callback?: Function):Alaska$Query;
  static findByIdAndRemove(id: Object|string|number, options?: Object, callback?: Function):Alaska$Query;
  static findOne(conditions?: Object, projection?: Object, options?: Object, callback?: Function):Alaska$Query|Promise<Alaska$Model>;
  static findOneAndUpdate(conditions: Object, update: Object, options?: Object, callback?: Function):Alaska$Query;
  static findOneAndRemove(conditions: Object, options?: Object, callback?: Function):Alaska$Query;
  static update(conditions: Object, doc: Object, options?: Object, callback?: Function):Alaska$Query;
  static count(conditions?: Object, callback?: Function):Promise<number>;
  static distinct(field: string, conditions?: Object, callback?: Function):Alaska$Query|Promise<any[]>;
  static where(path: string|Object, val?: any):Alaska$Query;
  static $where(js: string|Function):Alaska$Query;
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
  // model(name: string):Class<Alaska$Model>;
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
  static title?:string;
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
  static collection?:string;
  static groups:{
    [key:string]: {
      title:string;
      panel?:boolean;
      style?:Alaska$style;
    }
  };
  static service:Alaska$Service;
  static db:Mongoose$Connection;
  static MongooseModel:Alaska$Model;
  static schema:Mongoose$Schema;
  static prefix:string;
  static autoSelect:boolean;
  static defaultScope:{ [field:string]:boolean };
  static defaultSort?:string;
  static defaultLimit?:number;
  static titleField:string;
  static userField:string;
  static searchFields:string[] | string;
  static defaultColumns:string[] | string;
  static defaultFilters?:Object | (ctx: Alaska$Context) => Alaska$filters;
  static scopes:{
    [scope:string]:string | { [field:string]:boolean }
  };
  static fields:{
    [path:string]:Alaska$Field$options
  };
  static _fields:{
    [path:string]: Alaska$Field
  };
  static virtuals:{};
  static api:{
    all?: number,
    list?: number,
    show?: number,
    count?: number,
    create?: number,
    update?: number,
    updateMulti?: number,
    remove?: number,
    removeMulti?: number,
  };
  static actions:{
    [key:string]:false | {
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
    }
  };

  static relationships:Alaska$Model$relationships;
  static populations:Alaska$Model$populations;

  static pre(action: string, fn: Function): void;
  static post(action: string, fn: Function): void;
  static register():void;
  static underscoreMethod(field: string, name: string, fn: Function):void;
  static createFilters(search: string, filters?: Object|string): Alaska$filters;
  static createFiltersByContext(ctx: Alaska$Context, state?: Object): Alaska$filters;
  static paginate(conditions?: Object): Alaska$PaginateQuery;
  static paginateByContext(ctx: Alaska$Context, state?: Object): Promise<Alaska$PaginateResult>;
  static listByContext(ctx: Alaska$Context, state?: Object): Promise<Alaska$Model[]>;
  static showByContext(ctx: Alaska$Context, state?: Object): Promise<Alaska$Model>;
  static fromObject(data: Object): Alaska$Model;
  static fromObjectArray(array: Object[]): Alaska$Model[];
  static toObjectArray(array: Alaska$Model[]): Object[];
}

declare class Alaska$Query {
  constructor(conditions?: Object, options?: Object, model?: Alaska$Model, collection?: Mongoose$Collection):void;
  toConstructor():Alaska$Query;
  $where(js: string|Function):this;
  where(path?: Object|string, val?: any):this;
  equals(val: any):this;
  or(conditions: Object[]):this;
  nor(conditions: Object[]):this;
  and(conditions: Object[]):this;
  gt(path: string, val: any):this;
  gt(val: any):this;
  gte(path: string, val: any):this;
  gte(val: any):this;
  lt(path: string, val: any):this;
  lt(val: any):this;
  lte(path: string, val: any):this;
  lte(val: any):this;
  ne(path: string, val: any):this;
  ne(val: any):this;
  in(path: string, val: any[]):this;
  in(val: any[]):this;
  nin(path: string, val: any[]):this;
  nin(val: any[]):this;
  all(path: string, val: any[]):this;
  all(val: any[]):this;
  size(path: string, val: number):this;
  size(val: number):this;
  regex(path: string, val: RegExp):this;
  regex(val: RegExp):this;
  maxDistance(path: string, val: number):this;
  maxDistance(val: number):this;
  mod(path: string, val: number[]):this;
  mod(val: number[]):this;
  exists(path: string, val: boolean):this & Promise<Alaska$Model[]>;
  exists(val: boolean):this & Promise<Alaska$Model[]>;
  elemMatch(path: string|Object|Function, criteria: Object|Function):this;
  within():this;
  within(criteria: Object):this;
  within(...points: Array<[number, number]>):this;
  slice(path: string, val: number[] | number):this;
  slice(val: number[]|number):this;
  limit(val: number):this;
  skip(val: number):this;
  maxScan(val: number):this;
  batchSize(val: number):this;
  comment(val: string):this;
  snapshot():this;
  hint(val: Object):this;
  select(arg: Object|string):this;
  read(pref: string, tags: string[]):this;
  setOptions(options: Object|Alaska$Query):this;
  getQuery():Object;
  getUpdate():Object;
  lean(bool?: boolean):this;
  find(conditions?: Object, callback?: Function):Promise<Alaska$Model[]> & this;
  merge(source?: Object|Alaska$Query):this;
  findOne(conditions?: Object, projection?: Object, options?: Object, fn?: Function):this & Promise<Alaska$Model>;
  count(conditions?: Object, callback?: Function):this & Promise<number>;
  distinct(field?: string, conditions?: Object, callback?: Function):this;
  sort(arg: Object|string): Alaska$Query & Promise<Alaska$Model> & Promise<Alaska$Model[]>;
  remove(conditions?: Object, callback?: Function):this & Promise<void>;
  findOneAndUpdate(conditions?: Object, doc?: Object, options?: Object, callback?: Function):this;
  findOneAndRemove(conditions?: Object, options?: Object, callback?: Function):this;
  update(conditions?: Object, doc?: Object, options?: Object, callback?: Function):this;
  exec(op?: string|Function, callback?: Function):Promise<any>;
  then(resolve?: Function, reject?: Function):Promise<any>;
  catch(reject?: Function):Promise<any>;
  populate(path: string|Object, select?: Object|string, model?: Alaska$Model, match?: Object, options?: Object):this;
  cast(model: Alaska$Model, obj?: Object):Object;
  stream(options?: Object):Mongoose$QueryStream;
  cursor(options?: Object):Mongoose$QueryCursor;
  tailable(bool?: boolean, options?: Object):this;
  intersects(arg?: Object):this;
  geometry(object: Object):this;
  near(path: string, val: Object):this;
  near(val: Object):this;
  polygon(path: string, ...coordinatePairs: Array<[number, number]>):this;
  polygon(...coordinatePairs: Array<[number, number]>):this;
  box(val: Object|Array<[number, number]>, upperRight?: Array<[number, number]>):this;
  circle(path: string, val: Object):this;
  circle(val: Object):this;
  selected():boolean;
  selectedInclusively():boolean;
  selectedExclusively():boolean;
}

declare class Alaska$PaginateQuery extends Alaska$Query {
  search(keyword: string): this;
  page(page: number): this;
}

declare type Alaska$PaginateResult = {
  page:number;
  limit:number;
  total:number;
  totalPage:number;
  next:number;
  previous:number;
  results:Alaska$Model[]
};

declare class Alaska$Field {
  static classOfField:true;
  static plain:any;
  static dbOptions? :string[];
  static viewOptions? :Array<string| (options: Object, field: Alaska$Field)=>void >;
  static defaultOptions? :Indexed;
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
  type:Class<Alaska$Field>;
  defaultValue:void|any;
  dataType:Function;
  label:string;
  path:string;
  ref?: Class<Alaska$Model>;
  group:void|string;
  multi:boolean;
  hidden:void|boolean;
  fixed:void|boolean;
  horizontal:void|boolean;
  nolabel:void|boolean;
  disabled:void|boolean | Alaska$Field$depends;
  super:void|boolean;
  help:void|string;
  cell:void|string|boolean;
  view:void|string;
  filter:void|string|boolean;
  depends:void|Alaska$Field$depends;
  after:void|string;
  private:boolean;
  _model:Class<Alaska$Model>;
  _schema: Mongoose$Schema;
  _options: Alaska$Field$options;

  viewOptions():{ label:string;plain:Object|string };
  init():void;
  underscoreMethod(name: string, fn: Function):void;
  createFilter(filter: Object, filters: Object): any;
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
  options?: Alaska$SelectField$option[];
  type?: Class<Alaska$Field> | string | Function | void;
  defaultValue:void|any;
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
  after?:string;
};

declare type Alaska$Field$depends= string | {
  [path:string]:any
};

declare class Alaska$Service {
  static classOfService: true;
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
  templatesDirs:string[];

  constructor(options?: Alaska$Service$options):void;
  getCacheDriver(options: Object | string, createNew?: boolean): Alaska$CacheDriver;
  createDriver(options: Object): Alaska$Driver;
  freeDriver(driver: Alaska$Driver):void;
  pre(action: string, fn: Function): void;
  post(action: string, fn: Function): void;
  panic:(message: string|number, code?: number) => void;
  error:(message: string|number, code?: number) => void;
  try: <T>(promise: Promise<T>) => Promise<T>;
  adminSettings(ctx: Alaska$Context, user: User, settings: Object): Promise <void>;
  addConfigDir(dir: string):void;
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
  app: Koa;
  service(id: string, optional?: boolean):Alaska$Service;
  registerModel(Model: Class<Alaska$Model>): Promise<Class<Alaska$Model>>;
  config(key: string, defaultValue: any): any;
  toJSON():Object;
  post(action: string, fn: Function): void;
  panic:(message: string|number, code?: number) => void;
  error:(message: string|number, code?: number) => void;
  try: <T>(promise: Promise<T>) => Promise<T>;
}

declare class Alaska$Driver {
  static classOfDriver: true;
  instanceOfDriver: boolean;
  service: Alaska$Service;
  options:Object;
  idle:number;
  idleId:string;

  constructor(service: Alaska$Service, options: Object):void;
  driver():any;
  free():void;
  destroy():void;
  onFree():void;
  onDestroy():void;
}

declare class Alaska$CacheDriver extends Alaska$Driver {
  static classOfCacheDriver:true;
  instanceOfCacheDriver:true;

  constructor(service: Alaska$Service, options: Object):void;
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

declare class Alaska$QueueDriver extends Alaska$Driver {
  static classOfQueueDriver:true;
  instanceOfQueueDriver:true;
  key:string;

  constructor(service: Alaska$Service, options: Object):void;
  push(item: any): Promise<void>;
  pop(timeout?: number): Promise<any>;
}

declare class Alaska$SubscribeDriver extends Alaska$Driver {
  static classOfSubscribeDriver:true;
  instanceOfSubscribeDriver:true;
  channel:string;

  constructor(service: Alaska$Service, options: Object):void;
  publish(message: Object): Promise<void>;
  subscribe(): Promise<Object>;
  read(timeout: ?number): Promise<Object|null>;
  once(timeout: ?number): Promise<Object|null>;
  cancel(): Promise<void>;
}

declare type Alaska$emailMessage={
  from?:string;
  to?:string;
  cc?:string;
  bcc?:string;
  subject?:string;
  text?:string;
  html?:string;
  attachments?:Object[];
  replyTo?:string;
  encoding?:string;
  messageId?:string;
  headers?:Object;
  [key:string]:any
};

declare class Alaska$EmailDriver extends Alaska$Driver {
  static classOfEmailDriver:true;
  instanceOfEmailDriver:true;

  constructor(service: Alaska$Service, options: Object):void;
  send(data: Alaska$emailMessage): Promise<Object>;
}

declare class Alaska$Renderer {
  static classOfRenderer: true;
  service: Alaska$Service;
  options: Alaska$Config$renderer;

  constructor(service: Alaska$Service, options: Alaska$Config$renderer):void;
  renderFile (pathName: string, locals: Object): Promise<string>;
  render (template: string, locals: Object): string;
  getFileMap(): { [file:string]:string };
}

declare class Alaska$NormalError extends Error {
  constructor(message: string|number, code?: number):void;
}

declare module alaska {
  declare export var NormalError: Class<Alaska$NormalError>;
  declare export var Alaska: Class<Alaska$Alaska>;
  declare export var Service: Class<Alaska$Service>;
  declare export var Model: Class<Alaska$Model>;
  declare export var Sled: Class<Alaska$Sled>;
  declare export var Field: Class<Alaska$Field>;
  declare export var Renderer: Class<Alaska$Renderer>;
  declare export var Driver: Class<Alaska$Driver>;
  declare export var utils: Object;
  declare export var CLOSED: 0;
  declare export var PUBLIC: 1;
  declare export var AUTHENTICATED: 2;
  declare export var OWNER: 3;
  declare var exports: Alaska$Alaska;
  declare export default Alaska$Alaska;
}
