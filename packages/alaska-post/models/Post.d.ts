import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Post extends Model { }
interface Post extends PostFields { }

export interface PostFields {
  title: string;
  user: RecordId;
  cat: RecordId;
  cats: RecordId[];
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  summary: string;
  pic: Image;
  content: string;
  source: string;
  hots: number;
  recommend: boolean;
  relations: RecordId[];
  createdAt: Date;
}

export default Post;
