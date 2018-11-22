import { Service } from 'alaska';
import Help from './models/Help';

declare class HelpService extends Service {
  models: {
    Help: typeof Help;
  }
}

export default HelpService;
