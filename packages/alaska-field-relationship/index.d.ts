import { Field, Model } from 'alaska-model';

export default class RelationshipField extends Field {
  // Model id
  model: string;
  optional: boolean;
}
