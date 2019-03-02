import { Model } from 'alaska-model';
import { ShowcaseItem } from '../types';

declare class Showcase extends Model { }
interface Showcase extends ShowcaseFields { }

export interface ShowcaseFields {
  title: string;
  place: string;
  layout: string;
  height: number;
  width: number;
  sort: number;
  activated: boolean;
  items: ShowcaseItem[];
  startAt: Date;
  endAt: Date;
  createdAt: Date;

  isValid(): boolean;
}

export default Showcase;
