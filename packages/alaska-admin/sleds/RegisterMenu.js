// @flow

import { Sled } from 'alaska';
import AdminMenu from '../models/AdminMenu';

/**
 * 注册管理员后台菜单
 */
export default class RegisterMenu extends Sled {

  async exec(params: {
    _id:Object;
    id:string;
  }): Promise<AdminMenu> {
    const id = params.id || params._id;

    let record = await AdminMenu.findById(id);
    if (record) {
      // $Flow
      return record;
    }

    record = new AdminMenu(params);
    record._id = id;
    await record.save();

    return record;
  }
}
