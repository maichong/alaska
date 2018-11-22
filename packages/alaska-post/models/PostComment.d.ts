import { Model } from 'alaska-model';
import { ObjectID } from 'mongodb';

declare class PostComment extends Model {
  id: string;
  post: ObjectID;
  topic: ObjectID;
  user: ObjectID;
  content: string;
  commentTo: ObjectID;
  agree: number;
  oppose: number;
  createdAt: Date;
}

export default PostComment;
