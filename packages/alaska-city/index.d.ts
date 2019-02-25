import { Service } from 'alaska';
import City from './models/City';

declare module 'alaska-http' {
  export interface AlaskaContext {
    city: City;
  }
}

export class CityService extends Service {
  models: {
    City: typeof City;
  };
}

declare const cityService: CityService;

export default cityService;
