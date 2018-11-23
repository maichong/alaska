export type ModuleType = 'ESModule' | 'CommonJs';

/**
 * JS Module
 */
export class Module {
  path: string;
  type: ModuleType;

  constructor(path: string, type: ModuleType) {
    this.path = path;
    this.type = type;
  }
}

/**
 * 项目内相对路径
 */
export class ModulePath {
  path: string;

  constructor(path: string) {
    this.path = path;
  }
}

export class ModuleTree {
  [key: string]: ModuleTree | Module | ModulePath | number | string | boolean | null | Array<ModuleTree | Module | ModulePath | number | string | boolean | null>;
}
