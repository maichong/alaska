import { Sled } from 'alaska-sled';
import { CreateParams } from '..';
import Commission from '../models/Commission';

export default class Create extends Sled<CreateParams, Commission[]> {
}
