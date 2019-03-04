import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Comment extends Model { }
interface Comment extends CommentFields { }

export interface CommentFields {
  type: string;
  content: string;
  pic: Image;
  pics: Image[];
  order: RecordId;
  orderGoods: RecordId;
  goods: RecordId;
  sku: RecordId;
  skuDesc: string;
  reply: RecordId;
  parents: RecordId[];
  createdAt: Date;
}

export default Comment;
