import { Model } from 'alaska-model';
import { ObjectId } from 'mongodb';

declare class User extends Model { }
interface User extends UserFields { }

export interface UserFields {
  username: string;
  email: string;
  password: string;
  avatar: Object;
  roles: Object[];
  abilities: Object[];
  createdAt: Date;
  displayName: string;

  auth(candidate: string): boolean;
}

export default User;
