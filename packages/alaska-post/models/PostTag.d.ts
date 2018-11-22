import { Model } from 'alaska-model';

declare class PostTag extends Model {
  id: string;
  title: string;
  createdAt: Date;
}

export default PostTag;
