import { Service } from 'alaska';
import Showcase from './models/Showcase';
import { Image } from 'alaska-field-image';

export class ShowcaseService extends Service {
  models: {
    Showcase: typeof Showcase;
  };
}

declare const showcaseService: ShowcaseService;

export default showcaseService;
