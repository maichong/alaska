export interface Favorite {
  id: string;
  user: string;
  type: string;
  title: string;
  pic: string;
  goods?: string;
  createdAt: Date;
}
