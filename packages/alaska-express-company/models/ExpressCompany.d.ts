import { Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class ExpressCompany extends Model {
}

interface ExpressCompany extends ExpressCompanyFields {
}

export interface ExpressCompanyFields {
  title: string;
  logo: Image;
  sort: number;
  createdAt: Date;
}

export default ExpressCompany;
