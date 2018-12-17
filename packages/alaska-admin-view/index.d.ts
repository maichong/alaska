import { Client, PaginateResult } from 'akita';
import { ObjectMap } from 'alaska';
import { ModelAction, Filter, Filters } from 'alaska-model';
import * as React from 'react';
import { Store } from 'redux';
import * as immutable from 'seamless-immutable';
import { DependsQueryExpression } from 'check-depends';
import { Colors, SelectOption } from '@samoyed/types';
import { LangGroup } from 'alaska-locale';

// exports

export const api: Client;

export const store: Store<State, any>;

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
}

export function query(options: QueryOptions): Promise<Cache>;

export class App extends React.Component<AppProps> {
}

export interface AppProps {
  views: Views;
}

// state

export interface State {
  caches: CachesState;
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
  records: Record[];
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
  records?: Record[];
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
}

export interface LoadListFailurePayload {
  model: string;
  error: Error;
}

// eslint-disable-next-line space-infix-ops
export type RecordList<T> = immutable.Immutable<PaginateResult<T> & { error?: Error; fetching: boolean }>;

export interface AnyRecordList extends RecordList<any> {
}

export type ListsState = immutable.Immutable<{
  [model: string]: AnyRecordList;
}>;

// caches

export interface CacheData extends PaginateResult<any> {
  filters: Filters | null;
  model: string;
  time: number;
}

export type Cache = immutable.Immutable<CacheData>;

export type CachesState = immutable.Immutable<{
  [model: string]: Cache[];
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

// admin前端定义，和alaska-model后端不同
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
  defaultColumns: string[];
  searchFields: string[];
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
    [ability: string]: true;
  };
  canCreate: boolean;
  canUpdate: boolean;
  canRemove: boolean;
  canUpdateRecord: (record: Object) => boolean;
  canRemoveRecord: (record: Object) => boolean;
}

export interface ModelRelationship {
  key?: string;
  ref: string;
  path: string;
  title?: string;
  private?: boolean;
  populations?: any;
  hidden?: DependsQueryExpression;
}

export interface FieldGroup {
  path: string;
  title?: string;
  form?: boolean;
  panel?: boolean;
  color?: Colors;
  wrapper?: string; // 自定义Wrapper占位符
  after?: string;
  horizontal?: boolean;
  ability?: string;
  super?: DependsQueryExpression;
  disabled?: DependsQueryExpression;
  hidden?: DependsQueryExpression;
  protected?: DependsQueryExpression;
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
  ability?: string;
  super?: DependsQueryExpression;
  disabled?: DependsQueryExpression;
  hidden?: DependsQueryExpression;
  protected?: DependsQueryExpression;
  help?: string;

  // layout
  fixed?: DependsQueryExpression;
  horizontal?: boolean;
  nolabel?: boolean;
  nosort?: DependsQueryExpression;
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
  target?: string;
  thumbSuffix?: string;
  defaultImage?: string;
  upload?: {
    model: string;
    path: string;
    leaveConfirm: string;
    service: string;
  };
}

export interface Service {
  id: string;
  models: {
    [modelName: string]: Model;
  };
  prefix?: string;
}

export interface Record {
  [path: string]: any;
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
export interface FilterViewProps {
  disabled: boolean;
  errorText: string;
  className: string;
  model: Model;
  field: Field;
  value: Filter;
  onChange: (v: Filter) => void;
  onClose: () => void;
}

export interface FilterView extends React.Component<FilterViewProps> { }

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
  record: immutable.Immutable<Record>;
  value: any;
  disabled: boolean;
  errorText: string;
  locale?: string;
  onChange: (v: any) => void;
}

export interface FieldView extends React.Component<FieldViewProps> { }

// ListView interface
export interface ListViewProps {
  model: Model;
  list: PaginateResult<any>;
  search?: string;
  filters?: Filters;
  sort?: string;
  columns?: string[];
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
  columns?: string[];
}

export interface PreView extends React.Component<PreViewProps> { }

// FilterEditorView interface
export interface FilterEditorViewProps {
  model: Model;
  value: any;
}

export interface FilterEditorView extends React.Component<FilterEditorViewProps> { }


export interface ActionMap {
  key: string;
  link?: string;
  action: ModelAction;
  onClick?: Function;
}
// Props
export interface ActionGroupProps {
  items: ActionMap[];
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
  columns?: string[];
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
  columns?: string[];
  selected?: immutable.Immutable<Record[]>;
  records: immutable.Immutable<Record[]>;
  sort?: string;
  onSort?: Function;
  onSelect?: Function;
  onActive?: Function;
}

export interface DataTableHeaderProps {
  model: Model;
  sort?: string;
  columns?: string[];
  select: boolean;
  onSelect: Function;
  onSort: Function;
}

export interface DataTableRowProps {
  model: Model;
  record: immutable.Immutable<Record>;
  columns?: string[];
  onActive?: Function;
  selected?: boolean;
  onSelect?: Function | null;
}

export interface DeniedPageProps {
}

export interface EditorProps {
  isNew?: boolean; //是否新建
  model: Model;
  record: immutable.Immutable<Record>;
  onChange: Function;
}

export interface EditorActionBarProps {
  model: Model;
  record: immutable.Immutable<Record>;
  isNew: boolean;
}

export interface EditorActionsProps {
  model: Model;
  record: immutable.Immutable<Record>;
  isNew: boolean;
}

export interface EditorPageProps {
  match: {
    params: {
      service: string;
      model: string;
      id: string;
    };
  };
}

export interface EditorToolbarProps {
}

export interface ErrorPageProps {
}

export interface FieldGroupProps extends FieldGroup {
  model: Model;
  record: immutable.Immutable<Record>;
  errors: ObjectMap<any>;
  isNew: boolean;
  fields: Field[];
  onFieldChange: Function;
}

export interface FilterEditorProps {
  model: Model;
  value: Filters;
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
  search?: string;
  filters?: Filters;
  sort?: string;
  columns?: string[];
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
  search: string;
  onSearch: Function;
  sort?: string;
}

export interface ListActionsProps {
  model: Model;
  filters: Filters;
  records: immutable.Immutable<Record[]>;
  selected: immutable.Immutable<Record[]>;
  sort?: string;
  search?: string;
}

export interface ListPageProps {
}

export interface ListToolbarProps {
  model: Model;
  filters?: Filter;
  columns?: string[];
  split?: boolean;
  onChangeColumns: Function;
  onFilters: Function;
  onSplit: Function;
}

export interface FiltersToolProps extends ToolProps {
  model: Model;
  filters?: Filter;
  onChange: Function;
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
}

export interface QuickEditorProps {
  model: Model;
  hidden: boolean;
  selected: immutable.Immutable<Record[]>;
  onCannel: (v: any) => void;
}

export interface QuickEditorActionBarProps {
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
}

export interface SidebarProps {
}

export interface ToolGroupProps {
}

export interface WidgetGroupProps {
}
