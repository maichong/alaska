import { Sled } from 'alaska-sled';
import AdminMenu from '../models/AdminMenu';
import { RegisterMenuParams } from '..';

/**
 * 注册管理员后台菜单
 */
export default class RegisterMenu extends Sled<RegisterMenuParams, AdminMenu> { }
