
import { Model } from 'alaska-model';
import { Context } from 'alaska-http';

function defaultFilters(ctx: Context) {
  if (ctx.state.superMode) return null;
  return {
    super: { $ne: true }
  };
}

export default class AdminNav extends Model {
  static label = 'Admin Nav';
  static icon = 'bars';
  static titleField = 'label';
  static defaultColumns = 'icon label type parent sort service link ability super activated';
  static defaultSort = '-sort';
  static searchFields = '_id label link parent';
  static defaultFilters = defaultFilters;

  static fields = {
    _id: {
      type: String
    },
    label: {
      label: 'Title',
      type: String,
      required: true
    },
    ability: {
      label: 'Ability',
      type: 'relationship',
      ref: 'alaska-user.Ability'
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0
    },
    super: {
      label: 'Super',
      type: Boolean,
      super: true,
      noexport: true
    },
    activated: {
      label: 'Activated',
      type: Boolean
    }
  };

  _id: string;
  id: string;
  label: string;
  sort: number;
  ability: string;
  super: boolean;
  activated: boolean;
}
