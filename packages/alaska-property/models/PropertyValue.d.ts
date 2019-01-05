import { Model } from 'alaska-model';

declare class PropertyValue extends Model { }
interface PropertyValue extends PropertyValueFields { }

export interface PropertyValueFields {
  title: string;
  prop: Object;
  cats: Object;
  catsIndex: any;
  common: boolean;
  sort: number;
  createdAt: Date;
}

export default PropertyValue;
