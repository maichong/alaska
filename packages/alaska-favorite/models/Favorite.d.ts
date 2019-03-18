import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Favorite extends Model { }
interface Favorite extends FavoriteFields { }

export interface FavoriteFields {
  title: string;
  pic: Image;
  user: RecordId;
  type: string;
  goods?: RecordId;
  createdAt: Date;
}

export default Favorite;
