
export interface ShowcaseItem {
  pic: string;
  action: string;
  url: string;
  height: number;
  width: number;
}

export interface Showcase {
  id: string;
  title: string;
  place: string;
  layout: string;
  height: number;
  width: number;
  sort: number;
  activated: boolean;
  items: ShowcaseItem[];
  startAt: string;
  endAt: string;
  createdAt: string;
}
