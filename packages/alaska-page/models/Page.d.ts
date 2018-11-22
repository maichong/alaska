import { Model } from 'alaska-model';

declare class Page extends Model {
  _id: string;
  title: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  template: string;
  createdAt: Date;
  content: string;
}

export default Page;
