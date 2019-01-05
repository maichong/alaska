import { Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Property extends Model { }
interface Property extends PropertyFields { }

export interface PropertyFields {
  title: string;
  icon: Image;
  pic: Image;
  desc: string;
  parent: Object;
  parents: Object[];
  children: Object[];
  activated: boolean;
  sort: number;
  createdAt: Date;
}

export default Property;
