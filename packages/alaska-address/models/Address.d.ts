import { Model } from 'alaska-model';

declare class Address extends Model {
  user: string;
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
