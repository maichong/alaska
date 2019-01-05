import { Model } from 'alaska-model';

declare class PostTag extends Model { }
interface PostTag extends PostTagFields { }

export interface PostTagFields {
  id: string;
  title: string;
  createdAt: Date;
}

export default PostTag;
