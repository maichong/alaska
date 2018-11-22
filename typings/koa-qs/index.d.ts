import * as Application from 'koa';

declare namespace compose { }

declare function compose(app: Application, mode?: 'extended' | 'strict' | 'first'): void;

export = compose;
