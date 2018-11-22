import { Model } from 'alaska-model';
import { ObjectID } from 'mongodb';

declare class PostTopic extends Model {
  id: string;
  title: string;
  pic: Object;
  summary: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  commentCount: number;
  hots: number;
  template: string;
  createdAt: Date;
}

export default PostTopic;
