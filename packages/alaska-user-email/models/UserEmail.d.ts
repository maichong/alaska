import { Model, RecordId } from 'alaska-model';

declare class UserEmail extends Model {
}

interface UserEmail extends UserEmailFields { }

export interface UserEmailFields {
  email: string;
  user: RecordId;
  createdAt: Date;
}

export default UserEmail;
