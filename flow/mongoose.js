declare class Mongoose$Aggregate {
  model(model: Class<Mongoose$Model>):this;
  append(ops: Object):this;
  project(arg: Object|string):this;
  group(arg: Object):this;
  match(arg: Object):this;
  skip(num: number):this;
  limit(num: number):this;
  near(parameters: Object):this;
  unwind(...fields: string[]):this;
  lookup(options: Object):this;
  sample(size: number):this;
  sort(arg: Object|string):this;
  read(pref: string, tags?: string[]):this;
  explain(callback: Function):Promise<any>;
  allowDiskUse(value: boolean):this;
  cursor(options: Object):this;
  addCursorFlag(flag: string, value: boolean):this;
  exec(callback: Function):Promise<any>;
  then(resolve?: Function, reject?: Function):Promise<any>;
}

declare class Mongoose$Collection {
  name:string;
  collectionName:string;
  conn:Mongoose$Connection;
  constructor(name: string, conn: Mongoose$Connection, opts: Object):void;
}

declare class Mongoose$Connection extends events$EventEmitter {
  base:Mongoose;
  collections:{};
  models:{};
  config:{
    autoIndex:boolean
  };
  replica:boolean;
  hosts:Array<{
    host:string;
    port:number;
    user:string;
    pass:string;
    name:string;
  }>;
  host:string;
  port:number;
  user:string;
  pass:string;
  name:string;
  options:Object;
  otherDbs:Mongoose$Connection[];
  readyState:string;
  db:any;
  constructor(base: Mongoose):void;
  open(host: string, database?: string, port?: number, options?: Object, callback?: Function):Promise<void>;
  dropDatabase(callback: Function):Promise<void>;
  openSet(uris: string, database?: string, options?: Object, callback?: Function):Promise<void>;
  error(err: Error, callback?: Function):void;
  onOpen(callback: Function):void;
  close(callback: Function):Promise<void>;
  onClose(callback: Function):void;
  collection(name: string, options?: Object):Mongoose$Collection;
  model(name: string, schema?: Mongoose$Schema, collection?: string):Mongoose$Model;
  modelNames():string[];
  shouldAuthenticate():boolean;
  authMechanismDoesNotRequirePassword():boolean;
  optionsProvideAuthenticationData(options?: Object):boolean;
}

declare class Mongoose$Schema {
  static reserved:{};
  static Types:{
    [key:string]:Function
  };
  static ObjectId:Object;

  obj:Object;
  paths:{
    [path:string]:Mongoose$SchemaType
  };
  subpaths:{};
  virtuals:{};
  singleNestedPaths:{};
  nested:{};
  inherits:{};
  callQueue:Array<[string, Array<any>]>;
  methods:{
    [name:string]:Function
  };
  statics:{
    [name:string]:Function
  };
  tree:{};
  query:{};
  childMongoose$Schemas:Mongoose$Schema[];
  options:Object;
  instanceOfMongoose$Schema:boolean;
  indexTypes:string[];

  constructor(obj: Object, options?: Object):void;
  defaultOptions(options: Object):Object;
  add(obj: Object, prefix: string):void;
  path(path: string, obj: Object|Object[]):this;
  eachPath(fn: Function):this;
  requiredPaths(invalidate: boolean):Object[];
  indexedPaths():Object[];
  pathType(path: string):string;
  queue(name: string, args: any[]):this;
  pre(method?: string, fn?: Function):this;
  post(method?: string, fn?: Function):this;
  plugin(fn?: Function, opts?: Object):this;
  method(name?: string, fn?: Function):this;
  static(name?: string, fn?: Function):this;
  index(fields: Object, options?: Object):this;
  set(key: string, value?: any):this;
  get(key: string):any;
  indexes():Array<[Object, Object]>;
  virtual(name: string, options?: Object):Mongoose$VirtualType;
  virtualpath(name: string):Mongoose$VirtualType;
  remove(path: string):void;
  loadClass(model: Function, virtualsOnly?: boolean):void;
}

declare class Mongoose$SchemaType {
  path: string;
  instance: string;
  validators: Array<{
    validator:Function;
    message:string;
    type:string;
  }>;
  setters: Function[];
  getters: Function[];
  options:Object;
  selected:boolean;

  constructor(path: string, options?: Object, instance?: string):void;
  default(val: Function|any):any;
  index(options: Object|boolean|string):this;
  unique(bool: boolean):this;
  text(bool: boolean):this;
  sparse(bool: boolean):this;
  set(fn: Function):this;
  get(fn: Function):this;
  validate(obj: RegExp|Function|Object, message?: string, type?: string):this;
  required(required: boolean, message?: string):this;
  select(val: boolean):this;
}

declare class Mongoose$VirtualType {
  path:string;
  getters:Function[];
  setters:Function[];
  options:Object;

  constructor(options: Object, name: string):void;
  get(fn: Function):this;
  set(fn: Function):this;
  applyGetters(value: Object, scope: Object):any;
  applySetters(value: Object, scope: Object):any;
}

declare class Mongoose$Query {
  constructor(conditions?: Object, options?: Object, model?: Mongoose$Model, collection?: Mongoose$Collection):void;
  toConstructor():Mongoose$Query;
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
  exists(path: string, val: boolean):this & Promise<Mongoose$Model[]>;
  exists(val: boolean):this & Promise<Mongoose$Model[]>;
  elemMatch(path: string|Object|Function, criteria: Object|Function):this;
  within():this;
  within(criteria: Object):this;
  within(...points: Array<[number, number]>):this;
  slice(path: string, val: number[] | number):this;
  slice(val: number[]|number):this;
  limit(val: number):this & Promise<Mongoose$Model[]>;
  skip(val: number):this & Promise<Mongoose$Model[]>;
  maxScan(val: number):this;
  batchSize(val: number):this;
  comment(val: string):this;
  snapshot():this;
  hint(val: Object):this;
  select(arg: Object|string):this;
  read(pref: string, tags: string[]):this;
  setOptions(options: Object|Mongoose$Query):this;
  getMongoose$Query():Object;
  getUpdate():Object;
  lean(bool?: boolean):this;
  find(conditions?: Object, callback?: Function):Promise<Mongoose$Model[]> & this;
  merge(source?: Object|Mongoose$Query):this;
  findOne(conditions?: Object, projection?: Object, options?: Object, fn?: Function):this & Promise<Mongoose$Model>;
  count(conditions?: Object, callback?: Function):this & Promise<number>;
  distinct(field?: string, conditions?: Object, callback?: Function):this;
  sort(arg: Object|string): Mongoose$Query & Promise<Mongoose$Model> & Promise<Mongoose$Model[]>;
  remove(conditions?: Object, callback?: Function):this & Promise<void>;
  findOneAndUpdate(conditions?: Object, doc?: Object, options?: Object, callback?: Function):this;
  findOneAndRemove(conditions?: Object, options?: Object, callback?: Function):this;
  update(conditions?: Object, doc?: Object, options?: Object, callback?: Function):this;
  exec(op?: string|Function, callback?: Function):Promise<any>;
  then(resolve?: Function, reject?: Function):Promise<any>;
  catch(reject?: Function):Promise<any>;
  populate(path: string|Object, select?: Object|string, model?: Mongoose$Model, match?: Object, options?: Object):this;
  cast(model: Mongoose$Model, obj?: Object):Object;
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

declare class Mongoose$QueryStream extends stream$Readable {
}

declare class Mongoose$QueryCursor extends stream$Readable {
  constructor(query: Mongoose$Query, options: Object):void;
  map(fn: Function):this;
  close(fn?: Function):Promise<void>;
  next(fn?: Function):Promise<void>;
  eachAsync(fn: Function, callback?: Function):Promise<void>;
}

declare class Mongoose$Document extends events$EventEmitter {
  schema:Mongoose$Schema;
  isNew:boolean;
  id:string;
  errors:Object[];

  constructor(obj: Object, fields?: Object, skipId?: boolean):void;
  init(doc: Object, opts?: Object, fn?: Function):this;
  update(doc: Object, options: Object, fn: Function):Mongoose$Query;
  set(path: string, val: any, type?: any, options?: Object):this;
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
}

declare class Mongoose$Model extends events$EventEmitter {

  // extends of Mongoose$Document

  schema:Mongoose$Schema;
  isNew:boolean;
  id:string;
  errors:Object[];

  constructor(obj: Object, fields?: Object, skipId?: boolean):void;
  init(doc: Object, opts?: Object, fn?: Function):this;
  update(doc: Object, options: Object, fn: Function):Mongoose$Query;
  set(path: string, val: any, type?: any, options?: Object):this;
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
  baseMongoose$ModelName:string;
  base:Mongoose;
  discriminators:Mongoose$Model[];

  static remove(conditions: Object, callback?: Function):Mongoose$Query;
  static find(conditions?: Object, projection?: Object, options?: Object, callback?: Function)
    :Mongoose$Query|Promise<Mongoose$Model[]>;
  static findById(id: Object|string|number, projection?: Object, options?: Object, callback?: Function)
    :Mongoose$Query|Promise<Mongoose$Model>;
  static findByIdAndUpdate(id: Object|string|number, update: Object, options?: Object, callback?: Function)
    :Mongoose$Query;
  static findByIdAndRemove(id: Object|string|number, options?: Object, callback?: Function):Mongoose$Query;
  static findOne(conditions?: Object, projection?: Object, options?: Object, callback?: Function)
    :Mongoose$Query|Promise<Mongoose$Model>;
  static findOneAndUpdate(conditions: Object, update: Object, options?: Object, callback?: Function):Mongoose$Query;
  static findOneAndRemove(conditions: Object, options?: Object, callback?: Function):Mongoose$Query;
  static update(conditions: Object, doc: Object, options?: Object, callback?: Function):Mongoose$Query;
  static count(conditions?: Object, callback?: Function):Mongoose$Query|Promise<number>;
  static distinct(field: string, conditions?: Object, callback?: Function):Mongoose$Query|Promise<any[]>;
  static where(path: string|Object, val?: any):Mongoose$Query;
  static $where(js: string|Function):Mongoose$Query;
  static create(doc: Object, fn?: Function):Promise<void>;
  static create(doc: Object[], fn?: Function):Promise<void>;
  static create(...doc: Array<Object|Function>):Promise<void>;
  static insertMany(doc: Object, fn?: Function):Promise<void>;
  static insertMany(doc: Object[], fn?: Function):Promise<void>;
  static insertMany(...doc: Array<Object|Function>):Promise<void>;
  static hydrate(obj: Object):Mongoose$Model;
  static mapReduce(o: Object, callback?: Function):Promise<Mongoose$Model>;
  static geoNear(near: Object|number[], callback?: Function):Promise<Mongoose$Model>;
  static geoSearch(conditions: Object, options?: Object, callback?: Function):Promise<Mongoose$Model>;
  static aggregate(options?: Object, fn?: Function):Mongoose$Aggregate|Promise<Mongoose$Model>;
  static populate(docs: Mongoose$Document|Array<Mongoose$Document>, paths: Object, callback?: Function)
    :Promise<Mongoose$Model>;

  constructor(obj: Object, fields?: Object, skipId?: boolean):void;
  save(options?: Object, fn?: Function):Promise<void>;
  increment():this;
  remove(options?: Object, fn?: Function):Promise<void>;
  model(name: string):Class<Mongoose$Model>;
  discriminator(name: string, schema: Mongoose$Schema):Class<Mongoose$Model>;
  ensureIndexes(options?: Object, fn?: Function):Promise<void>;
}

declare class Mongoose$MongooseError extends Error {
  static messages:{};
  static Mongoose$CastError:Class<Mongoose$CastError>;
  static Mongoose$ValidationError:Class<Mongoose$ValidationError>;
  static ValidatorError:Class<Mongoose$MongooseError>;
  static VersionError:Class<Mongoose$MongooseError>;
  static OverwriteMongoose$ModelError:Class<Mongoose$MongooseError>;
  static MissingMongoose$SchemaError:Class<Mongoose$MongooseError>;
  static DivergentArrayError:Class<Mongoose$MongooseError>;
}

declare class Mongoose$CastError extends Mongoose$MongooseError {
}

declare class Mongoose$ValidationError extends Mongoose$MongooseError {
}

declare class Mongoose {
  mongodb: Object; //mongodb
  mquery: Object; //mquery
  Mongoose: Class<Mongoose>;
  Aggregate: Class<Mongoose$Aggregate>;
  Collection: Class<Mongoose$Collection>;
  Connection: Class<Mongoose$Connection>;
  Schema: Class<Mongoose$Schema>;
  SchemaType: Class<Mongoose$SchemaType>;
  SchemaTypes: Object;
  Types: Object;
  VirtualType: Class<Mongoose$VirtualType>;
  Query: Class<Mongoose$Query>;
  Model: Class<Mongoose$Model>;
  Document: Class<Mongoose$Document>;
  Error: Class<Mongoose$MongooseError>;
  CastError: Class<Mongoose$CastError>;

  connection:Mongoose$Connection;
  version:string;

  set(key: string, value: any):this;
  get(key: string):any;
  createMongoose$Connection(uri: string, options?: Object):Mongoose$Connection;
  connect(uri: string, options?: Object):Promise<void>;
  disconnect(fn?: Function):Promise<void>;
  model(name: string|Function, schema?: Mongoose$Schema, collection?: string, skipInit?: boolean):Mongoose$Model;
  modelNames():string[];
  plugin(fn: Function, opts: Object):this;

}

declare module mongoose {
  declare var exports: Mongoose;
}
