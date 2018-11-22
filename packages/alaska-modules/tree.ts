type ModuleType = 'ESModule' | 'CommonJs' | 'Auto';

export class Module {
  path: string;
  type: ModuleType;

  constructor(path: string, type: ModuleType) {
    this.path = path;
    this.type = type;
  }
}

export class ModulePath {
  path: string;

  constructor(path: string) {
    this.path = path;
  }
}

export class ModuleTree {
  [key: string]: ModuleTree | Module | ModulePath | number | string | boolean | null | Array<ModuleTree | Module | ModulePath | number | string | boolean | null>;
}
