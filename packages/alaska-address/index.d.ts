import { Service } from 'alaska';
import Address from './models/Address';

export class AddressService extends Service {
  models: {
    Address: typeof Address;
  };
}

declare const addressService: AddressService;

export default addressService;
