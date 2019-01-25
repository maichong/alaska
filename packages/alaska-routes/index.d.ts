import { Extension, ObjectMap } from 'alaska';
import { Router } from 'alaska-http';

declare module 'alaska' {
  export interface Service {
    initRoutes(): Promise<void>;
  }
}

declare module 'alaska-modules' {
  export interface ServiceMetadata {
    routes?: ObjectMap<string>;
  }

  export interface PluginMetadata {
    routes?: ObjectMap<string>;
  }

  export interface ServiceModules {
    routes: ObjectMap<RouteConfigurator>;
  }

  export interface PluginModules {
    routes?: ObjectMap<RouteConfigurator>;
  }
}

interface RouteConfigurator {
  (router: Router): void;
}

export default class RoutesExtension extends Extension { }
