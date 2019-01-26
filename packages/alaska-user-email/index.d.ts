import { Service } from 'alaska';
import UserEmail from './models/UserEmail';

// Service
export class UserEmailService extends Service {
  models: {
    UserEmail: typeof UserEmail;
  };

  sleds: {
  };
}

declare const userEmailService: UserEmailService;

export default userEmailService;
