import { Model } from 'alaska-model';

declare class Client extends Model { }
interface Client extends ClientFields { }

export interface ClientFields {
  id: string;
  token: string;
  deviceId: string;
  platform: string;
  user: string;
  expiredAt: Date | null;
  createdAt: Date;
}

export default Client;
