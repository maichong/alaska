import { Service } from 'alaska';
import Page from './models/Page';

declare class PageService extends Service {
  models: {
    Page: typeof Page;
  }
}

export default PageService;
