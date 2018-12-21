import { Service } from 'alaska';
import Page from './models/Page';

export class PageService extends Service {
  models: {
    Page: typeof Page;
  }
}

declare const pageService: PageService;

export default pageService;
