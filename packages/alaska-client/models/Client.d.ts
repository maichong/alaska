import { Model, RecordId } from 'alaska-model';

declare class Client extends Model { }
interface Client extends ClientFields { }

export interface ClientFields {
  token: string;
  deviceId: string;
  platform: string;
  user: RecordId;
  expiredAt: Date | null;
  createdAt: Date;
}

export default Client;
