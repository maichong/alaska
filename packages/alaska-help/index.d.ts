import { Service } from 'alaska';
import Help from './models/Help';

export class HelpService extends Service {
  models: {
    Help: typeof Help;
  }
}

declare const helpService: HelpService;

export default helpService;
