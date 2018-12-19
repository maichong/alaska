
import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';
import * as stream from 'stream';
import * as AdminView from 'alaska-admin-view';
import { MainService, Service, Extension, ObjectMap } from 'alaska';
import { Context, ContextState } from 'alaska-http';
import { DependsQueryExpression } from 'check-depends';
import { Colors } from '@samoyed/types';

declare module 'alaska' {
  export interface Service {
    db: mongoose.Connection | null;
    models: ObjectMap<typeof Model>;
    initModels(): Promise<void>;
    registerModel(model: typeof Model): Promise<void>;
  }

  export interface ConfigData {
    'alaska-model'?: {
      mongodb: {
        uri: string;
        options?: mongoose.ConnectionOptions;
      };
    };
  }
}

declare module 'alaska-http' {
  export interface ContextState {
    [key: string]: any;
    search?: string;
    filters?: Filters;
  }
}

declare module 'alaska-modules' {
  export interface ServiceMetadata {
    models?: ObjectMap<string>;
  }

  export interface PluginMetadata {
    models?: ObjectMap<string>;
  }

  export interface ServiceModules {
    models: ObjectMap<typeof Model>;
  }

  export interface PluginModules {
    models: ObjectMap<typeof Model | ModelSettings | ModelGenerator>;
  }
}

//// alaska-model

export type RecordID = mongodb.ObjectID | string | number;

export default class ModelExtension extends Extension {
}

export interface Document extends mongoose.Document {
  __modifiedPaths?: string[];
  data(scope?: string | ModelFieldList): any;
}

export interface ModelSettings {
  db?: mongoose.Connection;
  collectionName?: string;
  label?: string;
  icon?: string;
  hidden?: boolean;
  nocreate?: boolean;
  noupdate?: boolean;
  noremove?: boolean;
  noexport?: boolean;
  titleField?: string;
  searchFields?: string | string[];
  defaultLimit?: number;
  defaultSort?: string;
  defaultColumns?: string | string[];
  defaultFilters?: null | Filters | FiltersGenerator;
  defaultScope?: ModelFieldList;
  scopes?: ObjectMap<string>;
  autoSelect?: boolean;
  listMode?: string[]; // ['List','Grid']
  cardView?: string;
  preView?: string;
  editorView?: string;
  filterEditorView?: string;
  schemaOptions?: {};
  actions?: ObjectMap<ModelAction>;
  api?: ModelApi;
  relationships?: ObjectMap<ModelRelationship>;
  populations?: ObjectMap<ModelPopulation>;
  groups?: ObjectMap<FieldGroup>;
  fields?: ObjectMap<FieldOption>;
  virtuals?: ObjectMap<any>;

  methods?: ObjectMap<Function>;

  preInit?: Function;
  postInit?: Function;
  preValidate?: Function;
  postValidate?: Function;
  preSave?: Function;
  postSave?: Function;
  preRemove?: Function;
  postRemove?: Function;
}

export interface ModelGenerator {
  (model: typeof Model): typeof Model;
}

export class Model {
  /** Base Mongoose instance the model uses. */
  static base: typeof mongoose;

  /**
   * If this is a discriminator model, baseModelName is the
   * name of the base model.
   */
  static baseModelName: string | undefined;

  /** Registered discriminators for this model. */
  static discriminators: any;

  static classOfModel: true;
  static modelName: string;
  static key: string;
  static id: string;
  static main: MainService;
  static service: Service;

  static db: mongoose.Connection;
  static MongooseModel: mongoose.Model<any>;
  static collection: mongoose.Collection;
  static collectionName?: string;
  static schema: mongoose.Schema;

  static label: string;
  static icon?: string;
  static hidden?: boolean;
  static nocreate?: boolean;
  static noupdate?: boolean;
  static noremove?: boolean;
  static noexport?: boolean;
  static titleField: string;
  static searchFields: string | string[];
  static defaultLimit: number;
  static defaultSort: string;
  static defaultColumns: string | string[];
  static defaultFilters: null | Filters | FiltersGenerator;
  static defaultScope: ModelFieldList;
  static scopes: ObjectMap<string>;
  static _scopes: ObjectMap<ModelFieldList>;
  static autoSelect: boolean;
  static listMode: string[]; // ['List','Grid']
  static cardView?: string;
  static preView?: string;
  static editorView?: string;
  static filterEditorView?: string;
  static schemaOptions: {};
  static actions: ObjectMap<ModelAction>;
  static api: ModelApi;
  static relationships: ObjectMap<ModelRelationship>;
  static populations: ObjectMap<ModelPopulation>;
  static groups: ObjectMap<FieldGroup>;
  static fields: ObjectMap<FieldOption>;
  static _fields: ObjectMap<Field>;
  static virtuals: ObjectMap<any>;
  static _virtuals: ModelFieldList;

  static lookup(ref: string): typeof Model | null;
  /**
   * 配置模型
   * @param {ModelSettings} config
   */
  static applySettings(config: ModelSettings): void;
  static pre(action: ModelHookName, fn: Function): void;
  static post(action: ModelHookName, fn: Function): void;
  static underscoreMethod(field: string, name: string, fn: Function): void;
  static register(): Promise<void>;
  static createFilters(search: string, filters?: Filters): Filters;
  static createFiltersByContext(ctx: Context, state?: ContextState): Promise<Filters>;
  static paginate<T>(this: { new(): T }, conditions?: any): PaginateQuery<T>;
  static paginateByContext<T>(this: { new(): T }, ctx: Context, state?: ContextState): PaginateQuery<T>;
  static listByContext<T>(this: { new(): T }, ctx: Context, state?: ContextState): DocumentQuery<T[], T>;
  static showByContext<T>(this: { new(): T }, ctx: Context, state?: ContextState): DocumentQuery<T | null, T>
  static fromObject<T>(this: { new(): T }, data: any): T;
  static fromObjectArray<T>(this: { new(): T }, array: any[]): T[];
  static toObjectArray(array: Model[]): any[];

  // Mongoose Model
  static watch(pipeline?: any[], options?: mongodb.ChangeStreamOptions & { session?: mongoose.ClientSession }): mongodb.ChangeStream;

  static translateAliases(raw: any): any;

  static bulkWrite(writes: any[], cb?: (err: any, res: mongodb.BulkWriteOpResultObject) => void): Promise<mongodb.BulkWriteOpResultObject>;

  static findById<T>(this: { new(): T }, id: any | string | number, projection?: any, options?: any): DocumentQuery<T | null, T>;

  static model(name: string): typeof Model;
  static $where<T>(this: { new(): T }, argument: string | Function): DocumentQuery<T, T>;
  static aggregate(aggregations?: any[]): mongoose.Aggregate<any[]>;
  static aggregate(aggregations: any[], cb: Function): Promise<any[]>;

  // static count(conditions: any): Query<number>;

  static countDocuments(): Query<number>;
  static countDocuments(criteria: any): Query<number>;

  static estimatedDocumentCount(): Query<number>;
  static estimatedDocumentCount(options: any): Query<number>;

  static create<T>(this: { new(): T }, docs: any[]): Promise<T[]>;
  static create<T>(this: { new(): T }, docs: any[], options?: mongoose.SaveOptions): Promise<T[]>;
  static create<T>(this: { new(): T }, ...docs: any[]): Promise<T>;
  static create<T>(this: { new(): T }, ...docsWithCallback: any[]): Promise<T>;

  static discriminator<U extends Document>(name: string, schema: mongoose.Schema): mongoose.Model<U>;

  static distinct(field: string): Query<any[]>;
  static distinct(field: string, conditions: any): Query<any[]>;


  static ensureIndexes(): Promise<void>;
  static ensureIndexes(options: any): Promise<void>;


  static createIndexes(cb?: (err: any) => void): Promise<void>;


  static find<T>(this: { new(): T }): DocumentQuery<T[], T>;
  static find<T>(this: { new(): T }, conditions: any): DocumentQuery<T[], T>;
  static find<T>(this: { new(): T }, conditions: any, projection?: any | null): DocumentQuery<T[], T>;
  static find<T>(this: { new(): T }, conditions: any, projection?: any | null, options?: any | null): DocumentQuery<T[], T>;


  static findByIdAndRemove<T>(this: { new(): T }): DocumentQuery<T | null, T>;
  static findByIdAndRemove<T>(this: { new(): T }, id: any | number | string): DocumentQuery<T | null, T>;
  static findByIdAndRemove<T>(this: { new(): T }, id: any | number | string, options: {
    /** if multiple docs are found by the conditions, sets the sort order to choose which doc to update */
    sort?: any;
    /** sets the document fields to return */
    select?: any;
  }): DocumentQuery<T | null, T>;


  static findByIdAndDelete<T>(this: { new(): T }): DocumentQuery<T | null, T>;
  static findByIdAndDelete<T>(this: { new(): T }, id: any | number | string): DocumentQuery<T | null, T>;
  static findByIdAndDelete<T>(this: { new(): T }, id: any | number | string, options: {
    /** if multiple docs are found by the conditions, sets the sort order to choose which doc to update */
    sort?: any;
    /** sets the document fields to return */
    select?: any;
  }): DocumentQuery<T | null, T>;


  static findByIdAndUpdate<T>(this: { new(): T }): DocumentQuery<T | null, T>;
  static findByIdAndUpdate<T>(this: { new(): T }, id: any | number | string, update: any): DocumentQuery<T | null, T>;
  static findByIdAndUpdate<T>(this: { new(): T }, id: any | number | string, update: any,
    options: { upsert: true; new: true } & mongoose.ModelFindByIdAndUpdateOptions): DocumentQuery<T, T>;
  static findByIdAndUpdate<T>(this: { new(): T }, id: any | number | string, update: any,
    options: mongoose.ModelFindByIdAndUpdateOptions): DocumentQuery<T | null, T>;


  static findOne<T>(this: { new(): T }, conditions?: any): DocumentQuery<T | null, T>;
  static findOne<T>(this: { new(): T }, conditions: any, projection: any): DocumentQuery<T | null, T>;
  static findOne<T>(this: { new(): T }, conditions: any, projection: any, options: any): DocumentQuery<T | null, T>;


  static findOneAndRemove<T>(this: { new(): T }): DocumentQuery<T | null, T>;
  static findOneAndRemove<T>(this: { new(): T }, conditions: any): DocumentQuery<T | null, T>;
  static findOneAndRemove<T>(this: { new(): T }, conditions: any, options: {
    /**
     * if multiple docs are found by the conditions, sets the sort order to choose
     * which doc to update
     */
    sort?: any;
    /** puts a time limit on the query - requires mongodb >= 2.6.0 */
    maxTimeMS?: number;
    /** sets the document fields to return */
    select?: any;
  }): DocumentQuery<T | null, T>;



  static findOneAndDelete<T>(this: { new(): T }): DocumentQuery<T | null, T>;
  static findOneAndDelete<T>(this: { new(): T }, conditions: any): DocumentQuery<T | null, T>;
  static findOneAndDelete<T>(this: { new(): T }, conditions: any, options: {
    /**
     * if multiple docs are found by the conditions, sets the sort order to choose
     * which doc to update
     */
    sort?: any;
    /** puts a time limit on the query - requires mongodb >= 2.6.0 */
    maxTimeMS?: number;
    /** sets the document fields to return */
    select?: any;
    /** like select, it determines which fields to return */
    projection?: any;
    /** if true, returns the raw result from the MongoDB driver */
    rawResult?: boolean;
    /** overwrites the schema's strict mode option for this update */
    strict?: boolean | string;
  }): DocumentQuery<T | null, T>;


  static findOneAndUpdate<T>(this: { new(): T }): DocumentQuery<T | null, T>;
  static findOneAndUpdate<T>(this: { new(): T }, conditions: any, update: any): DocumentQuery<T | null, T>;
  static findOneAndUpdate<T>(this: { new(): T }, conditions: any, update: any,
    options: { upsert: true; new: true } & mongoose.ModelFindOneAndUpdateOptions): DocumentQuery<T, T>;
  static findOneAndUpdate<T>(this: { new(): T }, conditions: any, update: any,
    options: mongoose.ModelFindOneAndUpdateOptions): DocumentQuery<T | null, T>;


  static geoSearch<T>(this: { new(): T }, conditions: any, options: {
    /** x,y point to search for */
    near: number[];
    /** the maximum distance from the point near that a result can be */
    maxDistance: number;
    /** The maximum number of results to return */
    limit?: number;
    /** return the raw object instead of the Mongoose Model */
    lean?: boolean;
  }): DocumentQuery<T[], T>;


  static hydrate<T>(this: { new(): T }, obj: any): T;


  static insertMany<T>(this: { new(): T }, docs: any[]): Promise<T[]>;
  static insertMany<T>(this: { new(): T }, docs: any[], options?: { ordered?: boolean; rawResult?: boolean } & mongoose.ModelOptions): Promise<T[]>;
  static insertMany<T>(this: { new(): T }, doc: any): Promise<T>;
  static insertMany<T>(this: { new(): T }, doc: any, options?: { ordered?: boolean; rawResult?: boolean } & mongoose.ModelOptions): Promise<T>;



  static init<T>(this: { new(): T }): Promise<T>;
  static register(): Promise<void>;


  static mapReduce<T, Key, Value>(this: { new(): T }, o: mongoose.ModelMapReduceOption<T, Key, Value>): Promise<any>;


  static populate<T>(this: { new(): T }, docs: any[], options: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): Promise<T[]>;
  static populate<T>(docs: any, options: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): Promise<T>;


  static remove(conditions: any): Query<mongodb.WriteOpResult['result']>;
  static deleteOne(conditions: any): Query<mongodb.WriteOpResult['result']>;
  static deleteMany(conditions: any): Query<mongodb.WriteOpResult['result']>;


  static replaceOne(conditions: any, replacement: any): Query<any>;


  static update(conditions: any, doc: any): Query<any>;
  static update(conditions: any, doc: any, options: mongoose.ModelUpdateOptions): Query<any>;
  static updateOne(conditions: any, doc: any): Query<any>;
  static updateOne(conditions: any, doc: any, options: mongoose.ModelUpdateOptions): Query<any>;
  static updateMany(conditions: any, doc: any): Query<any>;
  static updateMany(conditions: any, doc: any, options: mongoose.ModelUpdateOptions): Query<any>;

  static where(path: string, val?: any): Query<any>;

  constructor(data?: any, fields?: any, skipId?: boolean);

  _: any;

  // ModelProperties
  /** Base Mongoose instance the model uses. */
  base: typeof mongoose;

  /**
   * If this is a discriminator model, baseModelName is the
   * name of the base model.
   */
  baseModelName: string | undefined;

  /** Collection the model uses. */
  collection: mongoose.Collection;

  /** Connection the model uses. */
  db: mongoose.Connection;

  /** Registered discriminators for this model. */
  discriminators: any;

  /** The name of the model */
  modelName: string;

  /** Schema the model uses. */
  schema: mongoose.Schema;

  $isDefault(path?: string): boolean;

  $session(session?: mongoose.ClientSession): mongoose.ClientSession;

  depopulate(path: string): this;

  equals(doc: mongoose.MongooseDocument): boolean;

  execPopulate(): Promise<this>;

  isDirectSelected(path: string): boolean;

  get(path: string, type?: any): any;

  init(doc: mongoose.MongooseDocument, opts?: any): this;

  /** Helper for console.log */
  inspect(options?: any): any;

  invalidate(path: string, errorMsg: string | mongoose.NativeError, value: any, kind?: string): mongoose.Error.ValidationError | boolean;

  /** Returns true if path was directly set and modified, else false. */
  isDirectModified(path: string): boolean;

  /** Checks if path was initialized */
  isInit(path: string): boolean;

  isModified(path?: string): boolean;

  isSelected(path: string): boolean;

  markModified(path: string): void;

  /** Returns the list of paths that have been modified. */
  modifiedPaths(): string[];

  populate(): this;
  populate(path: string): this;
  populate(path: string, names: string): this;
  populate(options: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): this;

  populated(path: string): any;

  set(path: string, val: any, options?: any): this;
  set(path: string, val: any, type: any, options?: any): this;
  set(value: any): this;

  toJSON(options?: mongoose.DocumentToObjectOptions): any;

  toObject(options?: mongoose.DocumentToObjectOptions): any;

  toString(): string;

  unmarkModified(path: string): void;

  update(doc: any): Query<any>;
  update(doc: any, options: mongoose.ModelUpdateOptions): Query<any>;

  validate(): Promise<void>;
  validate(optional: any): Promise<void>;

  validateSync(pathsToValidate?: string | string[]): Error;

  /** Hash containing current validation errors. */
  errors: any;
  /** This documents _id. */
  _id: RecordID;
  id: string;

  /** Boolean flag specifying if the document is new. */
  isNew: boolean;

  // Document

  increment(): this;

  model(name: string): typeof Model;

  /** Override whether mongoose thinks this doc is deleted or not */
  isDeleted(isDeleted: boolean): void;
  /** whether mongoose thinks this doc is deleted. */
  isDeleted(): boolean;

  /**
   * Removes this document from the db.
   * @param fn optional callback
   */
  remove(): Promise<this>;

  save(options?: mongoose.SaveOptions): Promise<this>;
  save(): Promise<this>;

  __v?: number;

  __modifiedPaths?: string[];
  data(scope?: string | ModelFieldList): any;
}

export type ModelFieldList = ObjectMap<1>;

export interface FieldGroup {
  title?: string;
  panel?: boolean;
  form?: boolean;
  color?: Colors;
  wrapper?: string; // 自定义Wrapper占位符
  after?: string;

  /**
   * 禁用条件，管理端组件禁用，注意：和Field.disabled 不同， Group.disabled 不影响API接口字段权限
   */
  disabled?: DependsQueryExpression | AbilityCheckGate[];
  /**
   * 数据接口数据保护条件，数据接口不返回指定字段的值，只影响数据接口，不影响Admin接口
   */
  hidden?: DependsQueryExpression | AbilityCheckGate[];
  /**
   * 静态视图条件，只控制管理端组件是否禁用，和 disabled 的区别是：fixed不影响API接口
   */
  fixed?: DependsQueryExpression | AbilityCheckGate[];
  /**
   * 超级管理员模式，只控制管理端组件是否显示
   */
  super?: DependsQueryExpression | AbilityCheckGate[];
}

export interface ModelApi {
  paginate?: number;
  list?: number;
  show?: number;
  watch?: number;
  count?: number;
  create?: number;
  update?: number;
  updateMulti?: number;
  remove?: number;
  removeMulti?: number;
}

export interface ModelAction {
  key?: string;
  icon?: string;
  title?: string;
  style?: string;
  tooltip?: string;
  color?: Colors;
  sled?: string;
  view?: string;
  after?: string;
  editor?: boolean;
  list?: boolean;
  needRecords?: number;
  link?: string;

  /**
   * 禁用条件，管理端组件禁用，并且接口不允调用Action
   */
  disabled?: DependsQueryExpression | AbilityCheckGate[];
  /**
   * 前端视图隐藏条件，只控制管理端组件隐藏，不控制API接口
   */
  hidden?: DependsQueryExpression | AbilityCheckGate[];
  /**
   * 超级管理员模式，只控制管理端组件是否显示
   */
  super?: DependsQueryExpression | AbilityCheckGate[];
  confirm?: string;
  pre?: string;
  script?: string;
  post?: string;
}

export interface ModelRelationship {
  key?: string;
  ref: typeof Model | string;
  path: string;
  title?: string;
  populations?: ObjectMap<ModelPopulation>;
  protected?: boolean;
  hidden?: DependsQueryExpression | AbilityCheckGate[];
}

export interface ModelPopulation {
  path?: string;
  match?: Object;
  filters?: Object;
  model?: typeof Model;
  select?: string;
  _select?: ModelFieldList;
  scopes?: ObjectMap<string>;
  _scopes?: ObjectMap<ModelFieldList>;
  autoSelect?: boolean;
  populations?: ObjectMap<ModelPopulation>;
}

export type ModelHookName = 'register' | 'init' | 'validate' | 'save' | 'remove';

// Field

interface FieldBase {
  // Mongoose
  get?: Function;
  set?: Function;
  default?: any;
  index?: boolean;
  unique?: boolean;
  sparse?: boolean;
  text?: boolean;
  required?: boolean;
  select?: boolean;

  // Alaska
  path?: string;
  label?: string;
  plain?: FieldDataType;
  plainName?: string;
  multi?: boolean;
  view?: string;
  defaultValue?: any;
  group?: string;
  /**
   * 禁用条件，管理端组件禁用，并且接口不允许写
   */
  disabled?: DependsQueryExpression | AbilityCheckGate[];
  /**
   * 数据接口数据保护条件，数据接口不返回指定字段的值，只影响数据接口，不影响Admin接口
   */
  protected?: DependsQueryExpression | AbilityCheckGate[];
  /**
   * 接口数据保护条件，数据接口、Admin接口都不返回字段的值，但是管理端组件正常显示，可配合 hidden 条件来隐藏前端
   */
  private?: DependsQueryExpression | AbilityCheckGate[];
  /**
   * 前端视图隐藏条件，只控制管理端组件隐藏，不控制API接口
   */
  hidden?: DependsQueryExpression | AbilityCheckGate[];
  /**
   * 静态视图条件，只控制管理端组件是否禁用，和 disabled 的区别是：fixed不影响API接口
   */
  fixed?: DependsQueryExpression | AbilityCheckGate[];
  /**
   * 超级管理员模式，只控制管理端组件是否显示
   */
  super?: DependsQueryExpression | AbilityCheckGate[];
  horizontal?: boolean;
  nolabel?: boolean;
  noexport?: boolean;
  help?: string;
  cell?: string;
  filter?: string;
  after?: string;
  match?: RegExp;
  codeMirrorOptions?: any;
  options?: any;
  checkbox?: boolean;
  switch?: boolean;
}

export interface FieldOption extends FieldBase {
  type: string | typeof Field | typeof String | typeof Number | typeof Date | typeof Boolean | typeof Object | typeof Model;
  ref?: string | typeof Model;
}

export type FieldDataType = typeof String | typeof Boolean | typeof Number | typeof Object | typeof Date | typeof Array
  | typeof mongoose.Schema.Types.ObjectId
  | typeof mongoose.Schema.Types.Mixed
  | typeof mongoose.Schema.Types.Decimal128
  | typeof mongoose.Schema.Types.Embedded;

export class Field {
  static readonly classOfField: boolean;
  static fieldName: string;
  static plain: FieldDataType;
  static plainName?: string;
  static dbOptions?: string[];
  static viewOptions?: FieldViewOption[];
  static defaultOptions?: Object;

  readonly instanceOfField: true;
  _options: FieldOption;
  _schema: mongoose.Schema;
  _model: typeof Model;
  type: typeof Field;


  // Alaska
  plainName?: string;
  defaultValue?: any;
  label: string;
  path: string;
  ref?: typeof Model;
  format?: string;

  constructor(options: FieldOption, schema: any, model: typeof Model);
  underscoreMethod(name: string, fn: Function): void;
  initSchema(): void;
  viewOptions(): AdminView.Field;
  init(): void;
  parse(value: any): null | any;
}

interface Field extends FieldBase { }

interface FieldViewOptionGenerator {
  (options: any, field: Field): void;
}

interface FieldViewOptionValue {
  key: string;
  value: any;
}

export type FieldViewOption = string | FieldViewOptionGenerator | FieldViewOptionValue;

export type FilterValue = string | number | boolean | RegExp | Date | mongodb.ObjectId;

export type FilterObject = {
  $eq?: FilterValue;
  $ne?: FilterValue;
  $gt?: FilterValue;
  $gte?: FilterValue;
  $lt?: FilterValue;
  $lte?: FilterValue;
  $in?: FilterValue[];
  $nin?: FilterValue[];
};

export type Filter = FilterValue | FilterObject;

export type Filters = {
  [path: string]: Filter | Filters[];
};

// export type Filters = {
//   $or: Filters[]
// } | FilterGroup;

interface FiltersGenerator {
  (ctx: Context): Filters | Promise<Filters> | null;
}

export interface AbilityCheckGate {
  ability?: string;
  check?: DependsQueryExpression;
}

export class Query<T> extends DocumentQuery<T, any> { }
export class DocumentQuery<T, M> extends mongoose.mquery {
  $where(js: string | Function): this;

  all(val: number): this;
  all(path: string, val: number): this;

  and(array: any[]): this;

  batchSize(val: number): this;

  error(): Error | null;
  error(unset: null): this;
  error(err: Error): this;

  box(val: any): this;
  box(lower: number[], upper: number[]): this;

  cast(model: any, obj?: any): any;

  catch<TRes>(reject?: (err: any) => void | TRes | PromiseLike<TRes>): Promise<TRes>;

  circle(area: any): this;
  circle(path: string, area: any): this;

  collation(value: mongoose.CollationOptions): this;

  comment(val: string): this;

  count(): Query<number>;
  count(criteria: any): Query<number>;

  countDocuments(): Query<number>;
  countDocuments(criteria: any): Query<number>;

  estimatedDocumentCount(): Query<number>;
  estimatedDocumentCount(options: any): Query<number>;

  cursor(options?: any): QueryCursor<M>;

  distinct(): Query<any[]>;
  distinct(field: string): Query<any[]>;
  distinct(field: string, criteria: any | Query<any>): Query<any[]>;

  elemMatch(criteria: (elem: Query<any>) => void): this;
  elemMatch(criteria: any): this;
  elemMatch(path: string | any | Function, criteria: (elem: Query<any>) => void): this;
  elemMatch(path: string | any | Function, criteria: any): this;

  equals(val: any): this;

  exec(): Promise<T>;
  exec(operation: string | Function): Promise<T>;

  exists(val?: boolean): this;
  exists(path: string, val?: boolean): this;

  find(): DocumentQuery<M[], M>;
  find(criteria: any): DocumentQuery<M[], M>;

  findOne(): DocumentQuery<M | null, M>;
  findOne(criteria: any): DocumentQuery<M | null, M>;

  findOneAndRemove(): DocumentQuery<M | null, M>;
  findOneAndRemove(conditions: any): DocumentQuery<M | null, M>;
  findOneAndRemove(conditions: any, options: mongoose.QueryFindOneAndRemoveOptions): DocumentQuery<M | null, M>;

  findOneAndUpdate(): DocumentQuery<M | null, M>;
  findOneAndUpdate(update: any): DocumentQuery<M | null, M>;
  findOneAndUpdate(query: any, update: any): DocumentQuery<M | null, M>;
  findOneAndUpdate(query: any, update: any,
    options: { upsert: true; new: true } & mongoose.QueryFindOneAndUpdateOptions): DocumentQuery<M, M>;
  findOneAndUpdate(query: any, update: any, options: mongoose.QueryFindOneAndUpdateOptions): DocumentQuery<M | null, M>;

  geometry(object: { type: string; coordinates: any[] }): this;

  getQuery(): any;

  getUpdate(): any;

  gt(val: number): this;
  gt(path: string, val: number): this;

  gte(val: number): this;
  gte(path: string, val: number): this;

  hint(val: any): this;

  in(val: any[]): this;
  in(path: string, val: any[]): this;

  /** Declares an intersects query for geometry(). MUST be used after where(). */
  intersects(arg?: any): this;

  lean(bool?: boolean): Query<any>;

  limit(val: number): this;

  lt(val: number): this;
  lt(path: string, val: number): this;

  lte(val: number): this;
  lte(path: string, val: number): this;

  maxDistance(val: number): this;
  maxDistance(path: string, val: number): this;

  maxScan(val: number): this;

  merge(source: any | Query<any>): this;

  mod(val: number[]): this;
  mod(path: string, val: number[]): this;

  ne(val: any): this;
  ne(path: string, val: any): this;

  near(val: any): this;
  near(path: string, val: any): this;

  nin(val: any[]): this;
  nin(path: string, val: any[]): this;

  nor(array: any[]): this;

  or(array: any[]): this;

  polygon(...coordinatePairs: number[][]): this;
  polygon(path: string, ...coordinatePairs: number[][]): this;

  populate(path: string | any, select?: string | any, model?: any,
    match?: any, options?: any): this;
  populate(options: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): this;

  read(pref: string, tags?: any[]): this;

  readConcern(level: string): this;

  regex(val: RegExp): this;
  regex(path: string, val: RegExp): this;

  remove(): Query<mongodb.WriteOpResult['result']>;
  remove(criteria: any | Query<any>): Query<mongodb.WriteOpResult['result']>;

  select(arg: string | any): this;
  selected(): boolean;
  selectedExclusively(): boolean;
  selectedInclusively(): boolean;
  setOptions(options: any): this;
  setQuery(conditions: any): this;

  session(session: mongodb.ClientSession | null): this;

  size(val: number): this;
  size(path: string, val: number): this;

  skip(val: number): this;

  slaveOk(v?: boolean): this;

  slice(val: number | number[]): this;
  slice(path: string, val: number | number[]): this;

  snapshot(v?: boolean): this;

  sort(arg: string | any): this;

  tailable(bool?: boolean, opts?: {
    numberOfRetries?: number;
    tailableRetryInterval?: number;
  }): this;

  then<TRes>(resolve?: (res: T) => void | TRes | PromiseLike<TRes>,
    reject?: (err: any) => void | TRes | PromiseLike<TRes>): Promise<TRes>;

  update(): Query<number>;
  update(doc: any): Query<number>;
  update(criteria: any, doc: any): Query<number>;
  update(criteria: any, doc: any, options: mongoose.QueryUpdateOptions): Query<number>;

  where(path?: string | any, val?: any): this;

  within(val?: any): this;
  within(coordinate: number[], ...coordinatePairs: number[][]): this;

  static use$geoWithin: boolean;
}

export class PaginateQuery<M> extends DocumentQuery<PaginateResult<M>, M> {
  search(keyword: string): this;
  page(page: number): this;
}

// eslint-disable-next-line space-infix-ops
export type PaginateResult<M> = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  next: number;
  previous: number;
  search: string;
  results: M[];
};

interface QueryCursor<T> extends stream.Readable {
  constructor(query: Query<T>, options: any): QueryCursor<T>;

  close(): Promise<any>;

  eachAsync(fn: (doc: T) => any): Promise<T>;

  eachAsync(fn: (doc: T) => any, options: mongoose.EachAsyncOptions): Promise<T>;

  map(fn: (doc: T) => T): this;

  next(): Promise<any>;
}
