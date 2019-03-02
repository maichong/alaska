
export interface Event<T=any> {
  id: string;
  pic: string;
  type: string;
  title: string;
  content: string;
  user: string;
  from: string;
  level: number;
  top: boolean;
  parent: string;
  info: T;
  read: boolean;
  createdAt: string;
}
