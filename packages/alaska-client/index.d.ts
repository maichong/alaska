import { Service } from 'alaska';
import Client from './models/Client';

declare class ClientService extends Service {
  models: {
    Client: typeof Client;
  };
}

declare const CLIENT: ClientService;

export default CLIENT;
