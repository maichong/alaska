import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Property extends Model { }
interface Property extends PropertyFields { }

export interface PropertyFields {
  title: string;
  icon: Image;
  pic: Image;
  desc: string;
  parent: RecordId;
  parents: RecordId[];
  children: RecordId[];
  activated: boolean;
  sort: number;
  createdAt: Date;
}

export default Property;
