import { Model, RecordId } from 'alaska-model';

declare class Address extends Model { }
interface Address extends AddressFields { }

export interface AddressFields {
  user: RecordId;
  name: string;
  tel: string;
  zip: string;
  geo: [number, number];
  country: string;
  province: string;
  city: string;
  district: string;
  street: string;
  building: string;
  detail: string;
  isDefault: boolean;
  createdAt: Date;
}

export default Address;
