import { Service, Extension, ObjectMap } from 'alaska';

declare module 'alaska' {
  export interface Service {
    locales: LangGroup;
    initLocales(): Promise<void>;
  }

  export interface ConfigData {
    locales?: string[];
    localeCookieKey?: string;
    localeQueryKey?: string;
  }
}

declare module 'alaska-modules' {
  export interface ServiceMetadata {
    locales?: ObjectMap<string>;
  }

  export interface PluginMetadata{
    locales?: ObjectMap<string>;
  }

  export interface ServiceModules {
    locales: LangGroup;
  }

  export interface PluginModules {
    locales: LangGroup;
  }
}

declare module 'alaska-http' {
  export interface Context {
    locale?: string;
  }
  export interface ContextState {
    locale?: string;
  }
}

export interface Lang {
  [message: string]: string;
}

export interface LangGroup {
  [locale: string]: Lang;
}

export default class LocaleExtension extends Extension {
}
