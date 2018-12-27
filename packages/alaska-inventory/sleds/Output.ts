import { Sled } from 'alaska-sled';
import Inventory from '../models/Inventory';
import service, { OutputParams } from '..';
import { doInput } from './Input';

export default class Output extends Sled<OutputParams, Inventory> {
  async exec(params: OutputParams): Promise<Inventory> {
    if (this.result) return;
    let body = params.body;
    // @ts-ignore parse number
    body.quantity = parseInt(body.quantity);
    body.user = (params.admin || params.user)._id;
    if (!body.quantity || body.quantity < 1) service.error('Invalid quantity');
    body.quantity = -body.quantity;
    return await doInput(body);
  }
}
