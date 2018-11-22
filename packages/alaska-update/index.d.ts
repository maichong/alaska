import { Service, ObjectMap } from 'alaska';
import { ServiceModules } from 'alaska-modules';
import AppUpdate from './models/AppUpdate';

declare module 'alaska' {
  interface ConfigData {
    autoUpdate?: boolean;
  }
}

declare module 'alaska-modules' {
  export interface ServiceMetadata {
    updates?: ObjectMap<string>;
  }
  export interface ServiceModules {
    updates: UpdateFun;
  }
}

export interface UpdateServiceModules extends ServiceModules{
  updates: UpdateFun;
}

export interface UpdateFun {
  [key: string]: Function;
}

declare class UpdateService extends Service {
  models: {
    AppUpdate: typeof AppUpdate;
  }
}

export default UpdateService;
