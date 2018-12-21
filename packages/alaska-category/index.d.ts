import { Service } from 'alaska';
import UpdateCatRef from './sleds/UpdateCatRef';
import Category from './models/Category';

export class CategoryService extends Service {
  models: {
    Category: typeof Category;
  };
  sleds: {
    UpdateCatRef: typeof UpdateCatRef;
  }
}

declare const categoryService: CategoryService;

export default categoryService;

export interface UpdateCatRefParams {
  category: Category;
  removed?: boolean;
}
