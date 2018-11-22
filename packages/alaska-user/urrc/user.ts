export default function (options?: any) {
  let field = (options && options.user) || 'user';
  return {
    check(user: any, record: any): boolean {
      return record[field] && String(record[field]) === String(user.id);
    },
    filter(user: any) {
      return {
        [field]: user._id || user.id
      };
    }
  };
}
