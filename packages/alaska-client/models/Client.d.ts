import { Model } from 'alaska-model';

declare class Client extends Model {
  id: string;
  token: string;
  deviceId: string;
  platform: string;
  user: string;
  expiredAt: Date | null;
  createdAt: Date;
}

export default Client;
