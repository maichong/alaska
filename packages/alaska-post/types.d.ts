
export interface Post {
  id: string;
  title: string;
  user: string;
  cat: string;
  cats: string[];
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  summary: string;
  pic: string;
  content: string;
  source: string;
  hots: number;
  recommend: boolean;
  relations: string[];
  createdAt: string;
}
