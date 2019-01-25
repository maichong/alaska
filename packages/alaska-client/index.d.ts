import { Service } from 'alaska';
import Client from './models/Client';

declare module 'alaska-http' {
  export interface AlaskaContext {
    client: Client;
  }
}

export class ClientService extends Service {
  models: {
    Client: typeof Client;
  };
}

declare const clientService: ClientService;

export default clientService;
