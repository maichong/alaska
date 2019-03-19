import { Service } from 'alaska';
import { RecordId, Model } from 'alaska-model';
import { Image } from 'alaska-field-image';
import Favorite from './models/Favorite';
import Create from './sleds/Create';

export class FavoriteService extends Service {
  models: {
    Favorite: typeof Favorite;
  };
  sleds: {
    Create: typeof Create;
  };
  types: Map<string, typeof Model>;
}

declare const favoriteService: FavoriteService;

export default favoriteService;

/**
 * 创建收藏
 */
export interface CreateParams {
  user: RecordId;
  type: string;
  title?: string;
  pic?: Image | string;
  // 收藏类型
  goods?: RecordId;
  shop?: RecordId;
  brand?: RecordId;
  post?: RecordId;
  [key: string]: any;
}
