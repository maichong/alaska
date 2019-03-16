import { Model } from 'alaska-model';
import { ObjectId } from 'mongodb';
import { Image } from 'alaska-field-image';

declare class User extends Model { }
interface User extends UserFields { }

export interface UserFields {
  username: string;
  email: string;
  tel: string;
  displayName: string;
  password: string;
  avatar: Image;
  roles: string[];
  abilities: string[];
  createdAt: Date;

  auth(candidate: string): Promise<boolean>;
}

export default User;
