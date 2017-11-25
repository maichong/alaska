import Event from '../../../models/Event';

export const relationships = {
  events: {
    ref: Event,
    path: 'user',
    private: true
  }
};

export const fields = {
  lastEvent: {
    label: 'Last Event',
    ref: Event
  },
  lastReadEvent: {
    label: 'Last Read Event',
    ref: Event
  },
  lastReadEventDate: {
    label: 'Last Read Event Date',
    type: Date
  }
};

export const methods = {
  /**
   * 为该用户生成一个事件
   * @param {Object} data
   * @returns {Promise.<Event>}
   */
  async createEvent(data) {
    let event = new Event(data);
    event.user = this;
    await event.save();
    this.lastEvent = event._id;
    await this.save();
    return event;
  },
  /**
   * 设置某个事件已读
   * @param {Event|string|ObjectID} event
   * @returns {Promise.<void>}
   */
  async readEvent(event) {
    if (!event.save) {
      event = await Event.findById(event);
    }
    if (!event) throw new Error('Can not find event');
    event.read = true;
    await event.save();
    if (!this.lastReadEvent || !this.lastReadEventDate || event.createdAt > this.lastReadEventDate) {
      this.lastReadEvent = event;
      this.lastReadEventDate = event.createdAt;
      await this.save();
    }
  }
};
