import { Service, ServiceConfig, ConfigData, Extension, Loader, Config, Plugin } from 'alaska';
import { ModuleTree } from 'alaska-modules/tree';

export class ModulesMetadata {
  id: string;
  dir: string;
  configFileName: string;
  modulesDirs: string[];
  config: ConfigData;
  main: ServiceMetadata;
  libraries: {
    [id: string]: LibraryMetadata;
  };
  extensions: {
    [id: string]: ExtensionMetadata;
  };
  services: {
    [id: string]: ServiceMetadata;
  };
  allServices: string[];

  pre: (event: keyof this, fn: Function) => void;
  post: (event: keyof this, fn: Function) => void;

  load(): Promise<void>;
  loadConfig(): Promise<void>;
  loadExtensions(): Promise<void>;
  loadExtension(meta: ExtensionMetadata, extConfig: Object): Promise<void>;
  loadServices(): Promise<void>;
  loadService(meta: ServiceMetadata): Promise<void>;
  loadPlugins(): Promise<void>;
  loadSubServicePlugins(service: ServiceMetadata): Promise<void>;
  loadServiceConfigPlugins(service: ServiceMetadata): Promise<void>;
  loadServicePlugin(service: ServiceMetadata, plugin: PluginMetadata): Promise<void>;
  loadLibraries(): Promise<void>;
  loadLibrary(meta: LibraryMetadata): Promise<void>;

  build(): Promise<ModuleTree>;
  buildLibrary(meta: LibraryMetadata, tree: ModuleTree): Promise<void>;
  buildExtension(meta: ExtensionMetadata, tree: ModuleTree): Promise<void>;
  buildService(meta: ServiceMetadata, tree: ModuleTree): Promise<void>;
  buildPlugin(service: ServiceMetadata, tree: ModuleTree, pluginMeta: PluginMetadata, plugin: ModuleTree): Promise<void>;

  toModules(): Promise<Modules>;
  toScript(): Promise<string>;
}

export interface LibraryMetadata {
  id: string;
  path: string;
  type: string;
  dismiss: boolean;
}

export interface ExtensionMetadata {
  id: string;
  path: string;
  loader: Loader;
  dismiss: boolean;
}

export interface ServiceMetadata {
  id: string;
  path: string;
  configFile: string;
  loadConfig: ServiceConfig;
  config: null | ConfigData;
  dismiss: boolean;
  loadedSubServicePlugins?: boolean;
  loadedServiceConfigPlugins?: boolean;
  plugins: {
    [path: string]: PluginMetadata;
  };
}

export interface PluginMetadata {
  path: string;
  plugin?: string;
  configFile?: string;
  config?: any;
  dismiss: boolean;
}

export interface Modules {
  /**
   * Main Service ID
   */
  id: string;
  libraries: {
    [id: string]: any;
  };
  extensions: {
    [id: string]: typeof Extension;
  };
  services: {
    [id: string]: ServiceModules;
  };
}

export interface ServiceModules {
  id: string;
  service: Service;
  config: ConfigData;
  plugins: {
    [path: string]: PluginModules;
  };
}

export interface PluginModules {
  config?: any;
  plugin?: typeof Plugin;
}

// eslint-disable-next-line typescript/class-name-casing
export interface createMetadata {
  (id: string, dir: string, configFileName: string, modulesDirs?: string[]): ModulesMetadata;
}

export function createMetadata(id: string, dir: string, configFileName: string, modulesDirs?: string[]): ModulesMetadata;

export default function lookupModules(main: Service, dir: string): Promise<Modules>;
