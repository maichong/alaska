import { Model } from 'alaska-model';

declare class Keyword extends Model {
  title: string;
  hot: number;
  createdAt: Date;
}

export default Keyword;
