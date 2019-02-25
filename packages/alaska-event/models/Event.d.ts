import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class Event extends Model { }
interface Event extends EventFields { }

export interface EventFields {
  pic: Image;
  type: string;
  title: string;
  content: string;
  user: RecordId;
  from: RecordId;
  level: number;
  top: boolean;
  parent: RecordId;
  info: any;
  read: boolean;
  createdAt: Date;
}

export default Event;
