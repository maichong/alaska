import { Sled } from 'alaska-sled';
import { RegisterParams } from '..';
import User from '../models/User';

export default class Register extends Sled<RegisterParams, User> {
}
