import { Model } from 'alaska-model';

declare class Keyword extends Model { }
interface Keyword extends KeywordFields { }

export interface KeywordFields {
  title: string;
  hot: number;
  createdAt: Date;
}

export default Keyword;
