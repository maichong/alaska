import { Plugin } from 'alaska';
import { RecordID } from 'alaska-model';
import { PropData } from 'alaska-property';

declare module 'alaska-goods/models/Goods' {
  interface Goods {
    props: PropData[];
    propValues: RecordID[];
  }
}

export default class GoodsPropertyPlugin extends Plugin {
}
