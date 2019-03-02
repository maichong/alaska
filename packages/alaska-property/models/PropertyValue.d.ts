import { Model, RecordId } from 'alaska-model';

declare class PropertyValue extends Model { }
interface PropertyValue extends PropertyValueFields { }

export interface PropertyValueFields {
  title: string;
  prop: RecordId;
  cats: RecordId[];
  common: boolean;
  sort: number;
  createdAt: Date;
}

export default PropertyValue;
