import { Sled } from 'alaska-sled';
import Role from '../models/Role';
import { RegisterRoleParams } from '..';

export default class RegisterRole extends Sled<RegisterRoleParams, Role> {
}
