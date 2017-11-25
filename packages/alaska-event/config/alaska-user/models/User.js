'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.methods = exports.fields = exports.relationships = undefined;

var _Event = require('../../../models/Event');

var _Event2 = _interopRequireDefault(_Event);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const relationships = exports.relationships = {
  events: {
    ref: _Event2.default,
    path: 'user',
    private: true
  }
};

const fields = exports.fields = {
  lastEvent: {
    label: 'Last Event',
    ref: _Event2.default
  },
  lastReadEvent: {
    label: 'Last Read Event',
    ref: _Event2.default
  },
  lastReadEventDate: {
    label: 'Last Read Event Date',
    type: Date
  }
};

const methods = exports.methods = {
  /**
   * 为该用户生成一个事件
   * @param {Object} data
   * @returns {Promise.<Event>}
   */
  async createEvent(data) {
    let event = new _Event2.default(data);
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
      event = await _Event2.default.findById(event);
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