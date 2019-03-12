import * as React from 'react';
import * as H from 'history';
import * as immutable from 'seamless-immutable';
import { Client, PaginateResult } from 'akita';
import { ObjectMap } from 'alaska';
import { ModelAction, Filter, Filters, AbilityCheckGate } from 'alaska-model';
import { Store as ReduxStore } from 'redux';
import { Saga, Task } from '@redux-saga/types';
import { DependsQueryExpression } from 'check-depends';
import { Colors, SelectOption } from '@samoyed/types';
import { LangGroup } from 'alaska-locale';

// exports

export function setStorage(key: string, value: any): void;
export function getStorage(key: string): null | any;
export function removeStorage(key: string): void;

export function query(options: QueryOptions): Promise<QueryCache>;

export function setViews(views: Partial<Views>): void;

export const api: Client;

export const views: Views;

export const store: Store;

export interface Store extends ReduxStore<StoreState, any> {
  runSaga<S extends Saga>(saga: S, ...args: Parameters<S>): Task;
}

export interface UploadOptions {
  /**
   * 文件对象
   */
  file: File;
  /**
   * 模型ID
   */
  model: string;
  /**
   * 字段名称
   */
  field: string;
  /**
   * 当前Record ID
   */
  id: any;
}

export interface UploadResult {
  url: string;
}

export interface QueryOptions {
  model: string;
  filters?: Filters;
  search?: string;
  populations?: string[];
}

export class App extends React.Component<AppProps> {
}

export interface AppProps {
}

// state

export interface StoreState {
  queryCaches: QueryCachesState;
  details: DetailsState;
  layout: Layout;
  lists: ListsState;
  login: LoginState;
  settings: Settings;
  user: UserState;
  menus: Menus;
  action: ActionState;
}

export type UserState = immutable.Immutable<{
  id: string;
  avatar: string;
  displayName: string;
  email?: string;
  roles?: string[];
  abilities?: string[];
}>;

// action

export type ActionState = immutable.Immutable<{
  action: string;
  model: string;
  fetching: boolean;
  request: string;
  error: Error | null;
  records: string[];
  search: string;
  sort: string;
  filters: any;
  body: any;
  result: any;
}>;

export interface ActionRequestPayload {
  action: string;
  model: string;
  request: string;
  records?: string[];
  search?: string;
  sort?: string;
  filters?: any;
  body?: any;
}

// details

export interface ClearDetailsPayload {
  model: string;
  ids: string[];
}

export interface LoadDetailsPayload {
  model: string;
  id: any;
}

export interface ApplyDetailsPayload {
  model: string;
  data: any;
}

export interface RecordMap<T extends Record> {
  [id: string]: T;
}

export interface AnyRecordMap extends RecordMap<any> {
}

export type DetailsState = immutable.Immutable<{
  [model: string]: RecordMap<Record>;
}>;

// lists

export interface ClearListPayload {
  model?: string;
}

export interface LoadListPayload {
  model: string;
  page?: number;
  limit?: number;
  filters?: Filters;
  search?: string;
  sort?: string;
}

export interface LoadMorePayload {
  model: string;
}

export interface ApplyListPayload extends PaginateResult<any> {
  model: string;
  sort?: string;
}

export interface LoadListFailurePayload {
  model: string;
  error: Error;
}

// eslint-disable-next-line space-infix-ops
export type RecordList<T> = immutable.Immutable<PaginateResult<T> & { error?: Error; fetching: boolean; sort?: string; }>;

export interface AnyRecordList extends RecordList<any> {
}

export type ListsState = immutable.Immutable<{
  [model: string]: AnyRecordList;
}>;

// caches

export interface ClearQueryCachePayload {
  model: string;
}

export interface QueryCacheData extends PaginateResult<any> {
  filters: Filters | null;
  populations?: string[];
  model: string;
  sort?: string;
  time: number;
}

export type QueryCache = immutable.Immutable<QueryCacheData>;

export type QueryCachesState = immutable.Immutable<{
  [model: string]: QueryCache[];
}>;

// layout
export type Layout = '' | 'full' | 'icon' | 'hidden';

// login

export interface LoginPayload {
  username: string;
  password: string;
}

export type LoginState = immutable.Immutable<{
  error: Error | null;
}>;

// admin前端定义，和alaska-model后端有所不同
export interface Model {
  label: string;
  modelName: string;
  id: string;
  key: string;
  serviceId: string;

  listMode?: string[];
  preView?: string;
  cardView?: string;
  editorView?: string;
  filterEditorView?: string;

  titleField: string;
  defaultSort: string;
  defaultColumns: string;
  filterFields: string;
  groups: {
    [key: string]: FieldGroup;
  };
  relationships: ObjectMap<ModelRelationship>;
  actions: ObjectMap<ModelAction>;
  nocreate?: boolean;
  noupdate?: boolean;
  noremove?: boolean;
  noexport?: boolean;
  fields: {
    [path: string]: Field;
  };
  abilities: {
    [ability: string]: boolean;
  };
  canCreate: boolean;
  canUpdate: boolean;
  canRemove: boolean;
  canUpdateRecord: (record: any) => boolean;
  canRemoveRecord: (record: any) => boolean;
}

export interface ModelRelationship {
  key?: string;
  ref: string;
  path: string;
  title?: string;
  private?: boolean;
  populations?: any;
  hidden?: DependsQueryExpression | AbilityCheckGate[];
}

export interface FieldGroup {
  path: string;
  title?: string;
  form?: boolean;
  body?: boolean;
  full?: boolean;
  panel?: boolean;
  color?: Colors;
  wrapper?: string; // 自定义Wrapper占位符
  after?: string;
  horizontal?: boolean;

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

export interface Field {
  label: string;
  path: string;
  required?: boolean;
  cell: string;
  view: string;
  filter: string;
  plainName: string;
  default?: any;
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

  help?: string;

  // layout
  horizontal?: boolean;
  nolabel?: boolean;
  // TODO:
  nosort?: DependsQueryExpression | AbilityCheckGate[];
  // fields
  match?: string;
  translate?: boolean;
  placeholder?: string;
  service?: string;
  multiLine?: boolean;
  addonAfter?: string;
  addonBefore?: string;
  // relationship
  filters?: Filters;
  model?: string;
  modelTitleField?: string;
  // code & mixed
  codeMirrorOptions?: any[];
  // select
  options?: SelectOption[];
  checkbox?: boolean;
  switch?: boolean;
  multi?: boolean;
  after?: string;
  // date
  format?: string;
  cellFormat?: string;
  dateFormat?: string;
  timeFormat?: string;
  // number
  max?: number;
  min?: number;
  // balance
  unit?: string;
  size?: number;
  precision?: number;
  // image
  allowed?: string[];
  maxSize?: number;
  thumbSuffix?: string;
  driver?: string;
}

export interface Service {
  id: string;
  models: {
    [modelName: string]: Model;
  };
  prefix?: string | boolean;
}

// TODO: rename
export interface Record {
  [path: string]: any;
  _id?: any;
  id?: string;
  isNew?: boolean;
  _rev?: number;
}

export interface ImageData {
  _id: string;
  ext: string;
  path: string;
  url: string;
  thumbUrl: string;
  name: string;
  size: number;
}

export interface Settings {
  authorized: boolean;
  user: null | User;
  icon: string;
  logo: string;
  loginLogo: string;
  copyright: string;
  superMode: boolean;
  locale: string;
  locales: {
    [module: string]: LangGroup;
  };
  services: {
    [serviceId: string]: Service;
  };
  models: {
    [modelId: string]: Model;
  };
  abilities: {
    [name: string]: boolean;
  };
  navItems: NavItem[];
  menuItems: MenuItem[];
}

export interface NavItem {
  id: string;
  label: string;
  sort: number;
  ability: string;
  super: boolean;
  activated: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  type: string;
  nav?: string;
  parent: string;
  link: string;
  service: string;
  sort: number;
  ability: string;
  super: boolean;
  activated: boolean;
}

export interface Menu extends MenuItem {
  subs?: Menu[];
}

export type Menus = immutable.Immutable<{
  menusMap: {
    [key: string]: Menu[];
  };
  navId?: string;
}>;

export interface User {
  id: string;
  displayName: string;
  avatar: string;
  username: string;
}

// Views

/**
 * User resource relationship checker
 */
export interface URRC {
  /**
   * @param {any} user 一定存在，{}空对象代表访客
   * @param {Record} record 要检查的数据记录
   * @returns {boolean}
   */
  check(user: any, record: any): boolean;
}

export interface Route {
  path: string;
  component: typeof React.Component;
}

export interface Views {
  wrappers: {
    [name: string]: typeof React.Component[];
  };
  components: {
    [name: string]: typeof React.Component;
  };
  routes: Route[];
  widgets: typeof React.Component[];
  listTools: typeof React.Component[];
  editorTools: typeof React.Component[];
  urrc: ObjectMap<URRC>;
}


export interface RouteMetadata {
  path: string;
  component: string;
}

export interface ViewsMetadata {
  wrappers?: {
    [name: string]: string[];
  };
  components?: {
    [name: string]: string;
  };
  routes?: RouteMetadata[];
  widgets?: string[];
  listTools?: string[];
  editorTools?: string[];
  urrc?: {
    [name: string]: string;
  };
}

// 带路由页面的Props
export interface RouterProps<T = any> {
  history: H.History;
  location: H.Location;
  match: {
    isExact: boolean;
    params: T;
    path: string;
    url: string;
  };
}

// Widget interface
export interface WidgetProps {
}

export interface Widget extends React.Component<WidgetProps> { }

// Tool interface
export interface ToolProps {
  /**
   * 当前页面类型
   */
  page: 'list' | 'editor' | string;
}

export interface Tool extends React.Component<ToolProps> { }

// FilterView interface
export interface FilterViewProps<T=FilterFieldOptions> {
  className: string;
  model: Model;
  field?: Field;
  options: T;
  filters: Filters;
  value: Filter | void;
  onChange: (v: Filter) => void;
  onSearch: () => void;
}

export class FilterView extends React.Component<FilterViewProps> { }

export interface FilterFieldOptions {
  nolabel?: boolean;
  col?: string;
  width?: string;
  maxWidth?: string;
  className?: string;
}

// CellView interface
export interface CellViewProps {
  model: Model;
  field: Field;
  value: any;
}

export interface CellView extends React.Component<CellViewProps> { }

// FieldView interface
export interface FieldViewProps {
  className: string;
  model: Model;
  field: Field;
  record?: immutable.Immutable<Record>;
  value: any;
  disabled?: boolean;
  error?: Errors;
  locale?: string;
  onChange: (v: any, error?: Errors) => any;
}

export interface FieldView extends React.Component<FieldViewProps> { }

// ListView interface
export interface ListViewProps {
  model: Model;
  list: AnyRecordList;
  search?: string;
  filters?: Filters;
  sort?: string;
  columns?: string;
  selected?: immutable.Immutable<Record[]>;
  onSort?: Function;
  onSelect?: Function;
  onActive?: Function;
  onRemove?: Function;
}

export interface ListView extends React.Component<ListViewProps> { }

// EditorView interface
export interface EditorViewProps {
  model: Model;
  id: any;
  record: immutable.Immutable<Record>;
  disabled?: boolean;
  onChange: (v: any) => void;
}

export interface EditorView extends React.Component<EditorViewProps> { }

// CardView interface
export interface CardViewProps {
  model: Model;
  field: Field;
  record: immutable.Immutable<Record>;
  value: any;
}

export interface CardView extends React.Component<CardViewProps> {
  model: Model;
  record: immutable.Immutable<Record>;
  selected?: boolean;
  onSelect?: Function | null;
}

// PreView interface
export interface PreViewProps {
  model: Model;
  record: immutable.Immutable<Record>;
  columns?: string;
}

export interface PreView extends React.Component<PreViewProps> { }

// FilterEditorView interface
export interface FilterEditorViewProps {
  model: Model;
  value: any;
}

export interface FilterEditorView extends React.Component<FilterEditorViewProps> { }


export interface ActionItem {
  key: string;
  link?: string;
  action: ModelAction;
  onClick?: Function;
}

// Props
export interface ActionGroupProps {
  items: ActionItem[];
  model: Model;
  editor?: boolean;
  selected?: immutable.Immutable<Record[]>;
  records?: immutable.Immutable<Record[]>;
  record?: immutable.Immutable<Record>;
  disabled?: boolean;
}

export interface ActionViewProps {
  model: Model;
  action: ModelAction;
  onClick?: Function;
  link: string;
  disabled?: boolean;
  editor?: boolean;
  record?: immutable.Immutable<Record>;
  records?: immutable.Immutable<Record[]>;
  selected: immutable.Immutable<Record[]>;
}

export interface BodyProps {
}

export interface ColumnsToolProps {
  model: Model;
  columns?: string;
  onChange: Function;
}

export interface ContentProps {
}

export interface CopyrightProps {
}

export interface DashboardProps {
}

export interface DataTableProps {
  model: Model;
  columns?: string;
  selected?: immutable.Immutable<Record[]>;
  records: immutable.Immutable<Record[]>;
  activated?: immutable.Immutable<Record>;
  sort?: string;
  onSort?: Function;
  onSelect?: Function;
  onActive?: Function;
}

export interface DataTableHeaderProps {
  model: Model;
  sort?: string;
  columns?: string;
  select: boolean;
  onSelect: Function;
  onSort: Function;
}

export interface DataTableRowProps {
  model: Model;
  record: immutable.Immutable<Record>;
  columns?: string;
  onActive?: Function;
  active?: boolean;
  selected?: boolean;
  onSelect?: Function | null;
}

export interface DeniedPageProps {
}

export interface ErrorsObject {
  [key: string]: null | string | string[] | ErrorsObject | ErrorsObject[];
}

export type Errors = null | string | string[] | immutable.Immutable<ErrorsObject> | immutable.Immutable<ErrorsObject[]>;

export interface EditorProps {
  embedded?: boolean;
  model: Model;
  record: immutable.Immutable<Record>;
  errors: immutable.Immutable<ErrorsObject> | null;
  onChange: (data: any, errors: ErrorsObject | null) => any;
  disabled?: boolean;
}

export interface EditorActionBarProps {
  model: Model;
  record: immutable.Immutable<Record> | null;
}

export interface EditorActionsProps {
  model: Model;
  record: immutable.Immutable<Record>;
}

export interface EditorPageProps extends RouterProps<{
  service: string;
  model: string;
  id: string;
}> {
}

export interface EditorToolbarProps {
}

export interface ErrorPageProps {
}

export interface FieldGroupProps extends FieldGroup {
  embedded?: boolean;
  model: Model;
  record: immutable.Immutable<Record>;
  errors: immutable.Immutable<ErrorsObject>;
  fields: Field[];
  onFieldChange: Function;
}

export interface FilterEditorProps {
  model: Model;
  value: Filters;
  fields?: string;
  onChange: Function;
}

export interface HeaderProps {
}

export interface HomePageProps {
}

export interface ListProps {
  options: {
    [key: string]: any;
  };
  activated?: immutable.Immutable<Record> | null;
  model: Model;
  filters?: Filters;
  sort?: string;
  columns?: string;
  selected?: immutable.Immutable<Record[]>;
  onSort?: Function;
  onSelect?: Function;
  onActive?: Function;
}

export interface ListActionBarProps {
  model: Model;
  filters: Filters;
  records: immutable.Immutable<Record[]>;
  selected: immutable.Immutable<Record[]>;
  sort?: string;
}

export interface ListActionsProps {
  model: Model;
  filters: Filters;
  records: immutable.Immutable<Record[]>;
  selected: immutable.Immutable<Record[]>;
  sort?: string;
}

export interface ListPageProps {
}

export interface ListToolbarProps {
  model: Model;
  options?: any;
  filters?: Filter;
  columns?: string;
  split?: boolean;
  onChangeColumns: Function;
  onFilters: Function;
  onSplit: Function;
}

export interface LoadingPageProps {
}

export interface LoginFormProps {
}

export interface LoginPageProps {
}

export interface LogoProps {
}

export interface MenuProps {
  level: number;
  menus: Menu[];
  layout: string;
  opened: boolean;
  onChange: Function;
}

export interface MenuItemProps {
  level: number;
  menu: Menu;
  openId: string;
  onClick: Function;
  layout: string;
  opened: boolean;
  onChange: Function;
}

export interface MenuToggleProps {
}

export interface NavProps {
}

export interface NavItemProps {
  nav: NavItem;
  navId: string;
  onClick: Function;
}

export interface NodeProps extends React.HTMLAttributes<any> {
  tag?: string | false;
  wrapper: string;
  props: any;
  children: React.ReactNode;
  domRef?: any;
}

export interface QuickEditorProps {
  model: Model;
  hidden: boolean;
  selected: immutable.Immutable<Record[]>;
  onCannel: (v: any) => void;
}

export interface QuickEditorActionBarProps {
  errors: immutable.Immutable<ErrorsObject> | null;
  canEdit: boolean;
  saveText: string;
  onSave: Function;
  onCannel: Function;
}

export interface QuickEditorTitleBarProps {
  title: string;
  onCannel: Function;
}

export interface RelationshipProps {
  title?: string;
  model: Model;
  path: string;
  from: string;
  filters?: Filters;
}

export interface SearchFieldProps {
  value: string;
  placeholder: string;
  onChange: Function;
  onSearch: Function;
}

export interface SidebarProps {
}

export interface ToolGroupProps {
}

export interface WidgetGroupProps {
}

export interface ActionBarProps {
  className?: string;
  children: React.ReactNode;
}
