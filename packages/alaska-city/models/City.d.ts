import { Model, RecordId } from 'alaska-model';

declare class City extends Model { }
interface City extends CityFields { }

export interface CityFields {
  code: string;
  name: string;
  initial: string;
  tel: string;
  zip: string;
  isHot: boolean;
  parent: RecordId;
  level: number;
  sort: number;
  createdAt: Date;
}

export default City;
