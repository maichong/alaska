import { Plugin } from 'alaska';
import { RecordID } from 'alaska-model';

declare module 'alaska-goods/models/Goods' {
  interface Goods {
    props: Prop[];
    propValues: RecordID[];
  }
}

export default class GoodsPropertyPlugin extends Plugin {
}

export interface PropValue {
  id: RecordID;
  title: string;
}

export interface Prop {
  id: RecordID;
  title: string;
  sku: boolean;
  filter: boolean;
  values: PropValue[];
}
