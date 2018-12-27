import { RecordId, Model } from 'alaska-model';
import { PropData } from 'alaska-property';
import { Image } from 'alaska-field-image';

declare class Property extends Model {
}

export interface PropertyFields {
  key: string;
  pic: Image;
  goods: RecordId;
  desc: string;
  price: number;
  discount: number;
  inventory: number;
  volume: number;
  props: PropData[];
  createdAt: Date;
}

interface Property extends PropertyFields { }

export default Property;
