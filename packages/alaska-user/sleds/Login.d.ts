import { Sled } from 'alaska-sled';
import { LoginParams } from '..';
import User from '../models/User';

export default class Login extends Sled<LoginParams, User> {
}
