import { Service } from 'alaska';
import ExpressCompany from './models/ExpressCompany';

export class ExpressCompanyService extends Service {
  models: {
    ExpressCompany: typeof ExpressCompany;
  };
}

declare const expressCompanyService: ExpressCompanyService;

export default expressCompanyService;
