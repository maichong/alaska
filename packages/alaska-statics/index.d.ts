import { Extension, ObjectMap } from 'alaska';
import * as staticCache from 'koa-static-cache';

declare module 'alaska' {
  export interface MainService {
    initStatics(): Promise<void>;
  }

  export interface ConfigData {
    'alaska-statics'?: StaticsConfig;
  }
}

export interface StaticsConfig {
  [name: string]: Static;
}

export interface Static extends staticCache.Options {
  disabled?: boolean;
}

export default class StaticsExtension extends Extension { }
