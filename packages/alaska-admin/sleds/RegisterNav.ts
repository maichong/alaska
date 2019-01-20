import { Sled } from 'alaska-sled';
import AdminNav from '../models/AdminNav';
import { RegisterNavParams } from '..';

/**
 * 注册管理员后台导航
 */
export default class RegisterNav extends Sled<RegisterNavParams, AdminNav> {
  async exec(params: RegisterNavParams): Promise<AdminNav> {
    const id = params.id;

    let record = await AdminNav.findById(id);
    if (record) {
      return record;
    }

    record = new AdminNav(params);
    record._id = id;
    await record.save({ session: this.dbSession });

    return record;
  }
}
