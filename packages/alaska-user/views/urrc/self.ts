export default {
  check(user: any, record: any): boolean {
    return user && record && String(record.id) === String(user.id);
  }
}
