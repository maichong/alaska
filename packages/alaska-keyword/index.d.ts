import { Service, Plugin } from 'alaska';
import Keyword from './models/Keyword';

export class KeywordService extends Service {
  models: {
    Keyword: typeof Keyword;
  }
}

declare const keywordService: KeywordService;

export default keywordService;
