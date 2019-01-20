import { Sled } from 'alaska-sled';
import AdminMenu from '../models/AdminMenu';
import { RegisterMenuParams } from '..';

/**
 * 注册管理员后台菜单
 */
export default class RegisterMenu extends Sled<RegisterMenuParams, AdminMenu> {
  async exec(params: RegisterMenuParams): Promise<AdminMenu> {
    const id = params.id;

    let record = await AdminMenu.findById(id);
    if (record) {
      return record;
    }

    record = new AdminMenu(params);
    record._id = id;
    if (!record.parent && !record.nav) {
      record.nav = 'default';
    }
    await record.save({ session: this.dbSession });

    return record;
  }
}
