import { Model } from 'alaska-model';

export default class PropertyValue extends Model {
  title: string;
  prop: Object;
  cats: Object;
  catsIndex: any;
  common: boolean;
  sort: number;
  createdAt: Date;
}
