import { User } from 'alaska-user/types';

export interface Client {
  id: string;
  token: string;
  deviceId: string;
  platform: string;
  user: null | User;
}
