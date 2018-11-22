import { Model } from 'alaska-model';
import { ObjectID } from 'mongodb';

declare class Post extends Model {
  id: string;
  title: string;
  user: ObjectID;
  cat: ObjectID;
  cats: ObjectID[];
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  summary: string;
  pic: ObjectID;
  content: string;
  tags: ObjectID[];
  source: string;
  commentCount: number;
  hots: number;
  recommend: boolean;
  relations: ObjectID[];
  topics: ObjectID[];
  createdAt: Date;
}

export default Post;
