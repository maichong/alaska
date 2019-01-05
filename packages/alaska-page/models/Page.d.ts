import { Model } from 'alaska-model';

declare class Page extends Model { }
interface Page extends PageFields { }

export interface PageFields {
  title: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  template: string;
  createdAt: Date;
  content: string;
}

export default Page;
