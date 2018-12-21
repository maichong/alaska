import { Service } from 'alaska';
import Help from './models/Help';

export class HelpService extends Service {
  models: {
    Help: typeof Help;
  }
}

export default HelpService;
