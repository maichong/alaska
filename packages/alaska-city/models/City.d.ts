import { Model, RecordId } from 'alaska-model';

declare class City extends Model { }
interface City extends CityFields { }

export interface CityFields {
  name: string;
  initial: string;
  isHot: boolean;
  sort: number;
  createdAt: Date;
}

export default City;
