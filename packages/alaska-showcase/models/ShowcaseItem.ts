import { Model } from 'alaska-model';

export default class ShowcaseItem extends Model {
  static label = 'ShowcaseItem';
  static hidden = true;

  static groups = {
    default: {
      form: false,
      panel: false
    }
  };

  static fields = {
    pic: {
      label: 'Picture',
      type: 'image'
    },
    action: {
      label: 'Action',
      type: 'select',
      switch: true,
      default: 'url',
      options: [{
        label: 'URL',
        value: 'url'
      }]
    },
    url: {
      label: 'URL',
      type: String,
      hidden: {
        action: {
          $ne: 'url'
        }
      }
    },
    height: {
      label: 'Height',
      type: Number
    },
    width: {
      label: 'Width',
      type: Number
    }
  };
}
