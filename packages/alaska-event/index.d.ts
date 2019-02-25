import { Service } from 'alaska';
import Event from './models/Event';
import { RecordId } from 'alaska-model';

export class EventService extends Service {
  models: {
    Event: typeof Event;
  };
}

declare const eventService: EventService;

export default eventService;

declare module 'alaska-user/models/User' {
  export interface UserFields {
    lastEvent: RecordId;
    lastReadEvent: RecordId;
    lastReadEventDate: Date;
    lastReadEventAt: Date;

    createEvent(data: any): Promise<Event>;
    readEvent(event: Event | RecordId): Promise<Event>;
  }
}
