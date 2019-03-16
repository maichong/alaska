import { Field, Model } from 'alaska-model';
import * as events from 'events';

export default class RelationshipField extends Field {
  // Model id
  model: string;
  static watchDefault(ref: typeof Model, defaultField: string): { record: Model; watcher: events.EventEmitter };
}
