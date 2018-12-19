export default function () {
  return {
    check(user: any, record: any): boolean {
      return  String(record.id) === String(user.id);
    },
    filter(user: any) {
      return {
        _id: user._id || user.id
      };
    }
  };
}
