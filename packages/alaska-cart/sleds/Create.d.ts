import { Sled } from 'alaska-sled';
import CartGoods from '../models/CartGoods';
import service, { CreateParams } from '..';

export default class Create extends Sled<CreateParams, CartGoods> { }
