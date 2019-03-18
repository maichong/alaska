import { Service } from 'alaska';
import { RecordId } from 'alaska-model';
import User from 'alaska-user/models/User';
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
}

declare const favoriteService: FavoriteService;

export default favoriteService;

export type Create = Create;

/**
 * 创建收藏
 */
export interface CreateParams {
  [key: string]: any;
  user: User;
  type: string;//收藏类型
  goods?: string;
  path?: string; //目标类型对应的字段，例如商品path：goods
  title?: string;
  pic?: Image;
}
