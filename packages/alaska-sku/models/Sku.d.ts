import { RecordID, Model } from 'alaska-model';
import { PropData } from 'alaska-property';
import { Image } from 'alaska-field-image';

declare class Property extends Model {
  key: string;
  pic: Image;
  goods: RecordID;
  desc: string;
  price: number;
  discount: number;
  inventory: number;
  volume: number;
  valid: boolean;
  props: PropData[];
  createdAt: Date;
}

export default Property;
