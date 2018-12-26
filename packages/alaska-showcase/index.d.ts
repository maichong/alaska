import { Service } from 'alaska';
import { PropData } from 'alaska-property';
import Showcase from './models/Showcase';
import { Image } from 'alaska-field-image';

export class ShowcaseService extends Service {
  models: {
    Showcase: typeof Showcase;
  };
}

declare const skuService: ShowcaseService;

export default skuService;

export type Showcase = Showcase;

export interface ShowcaseItem {
  pic: string;
  action: string;
  url: string;
  height: number;
  width: number;
}
