import { Service } from 'alaska';
import Client from './models/Client';

declare module 'alaska-http' {
  interface Context {
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
