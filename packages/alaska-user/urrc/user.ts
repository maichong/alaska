import { isIdEqual } from 'alaska-model/utils';

export default function (options?: any) {
  let field = (options && options.user) || 'user';
  return {
    check(user: any, record: any): boolean {
      return isIdEqual(record[field], user.id);
    },
    filter(user: any) {
      return {
        [field]: user._id || user.id
      };
    }
  };
}
