import { Model } from 'alaska-model';
import { ObjectID } from 'mongodb';

declare class PostCat extends Model {
  id: string;
  title: string;
  parent: ObjectID;
  subCats: ObjectID[];
  sort: number;
  createdAt: Date;
}

export default PostCat;
