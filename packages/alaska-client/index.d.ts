import { Service } from 'alaska';
import Client from './models/Client';

export class ClientService extends Service {
  models: {
    Client: typeof Client;
  };
}

declare const CLIENT: ClientService;

export default CLIENT;
