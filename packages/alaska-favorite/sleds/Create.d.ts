import { Sled } from 'alaska-sled';
import Favorite from '../models/Favorite';
import { CreateParams } from '..';

export default class Create extends Sled<CreateParams, Favorite> { }
