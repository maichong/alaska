export default {
  check(user: any, record: any): boolean {
    return user && record && record.user && String(record.user) === String(user.id);
  }
};
