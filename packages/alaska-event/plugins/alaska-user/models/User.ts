import { RecordId } from 'alaska-model';
import Event from '../../../models/Event';

export default {
  fields: {
    lastEvent: {
      label: 'Last Event',
      type: 'relationship',
      ref: 'alaska-event.Event'
    },
    lastReadEvent: {
      label: 'Last Read Event',
      type: 'relationship',
      ref: 'alaska-event.Event'
    },
    lastReadEventDate: {
      label: 'Last Read Event Date',
      type: Date
    },
    lastReadEventAt: {
      label: 'Last Read Event At',
      type: Date
    }
  },
  methods: {
    /**
     * 为该用户生成一个事件
     * @param {Object} data
     * @returns {Promise.<Event>}
     */
    async createEvent(data: any): Promise<Event> {
      let event = new Event(data);
      event.user = this;
      await event.save({ session: this.$session() });
      this.lastEvent = event._id;
      await this.save();
      return event;
    },

    /**
     * 设置某个事件已读
     * @param {Event|string|ObjectID} event
     * @returns {Promise.<void>}
     */
    async readEvent(event: Event | RecordId): Promise<Event> {
      // @ts-ignore
      let e: Event = event;
      // @ts-ignore
      if (!event.save) {
        e = await Event.findById(event).session(this.$session());
      }
      if (!e) throw new Error('Can not find event');
      e.read = true;
      await e.save({ session: this.$session() });
      if (!this.lastReadEvent || !this.lastReadEventDate || e.createdAt > this.lastReadEventDate) {
        this.lastReadEvent = e;
        this.lastReadEventDate = e.createdAt;
        this.lastReadEventAt = new Date();
        await this.save();
      }
      return e;
    }
  }
};
