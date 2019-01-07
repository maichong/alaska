import { Model } from 'alaska-model';

export default class Chart extends Model {
  static label = 'Chart';
  static icon = 'line-chart';
  static defaultColumns = 'title sort createdAt';
  static defaultSort = '-sort';

  static groups = {
  };

  static api = {
    list: 0,
    count: 0,
    show: 0,
    create: 0,
    update: 0,
    remove: 0
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  createdAt: Date;

  preSave(){
    if(!this.createdAt){
      this.createdAt=new Date();
    }
  }
}
