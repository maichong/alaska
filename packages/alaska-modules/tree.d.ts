export type ModuleType = 'ESModule' | 'CommonJs' | 'Auto';

export class Module {
  path: string;
  type: ModuleType;

  constructor(path: string, type: ModuleType);
}

export class ModulePath {
  path: string;

  constructor(path: string);
}

export class ModuleTree {
  [key: string]: ModuleTree | Module | ModulePath | number | string | boolean | null | Array<ModuleTree | Module | ModulePath | number | string | boolean | null>;
}
