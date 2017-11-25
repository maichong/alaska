'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Ticket extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  /**
   * 验证是否有权访问ticket
   * @param {Context} ctx
   * @returns {boolean}
   */
  verify(ctx) {
    if (this.userId && (!ctx.user || ctx.user.id !== this.userId)) {
      return false;
    }
    if (!this.userId && this.sessionId && ctx.sessionId !== this.sessionId) {
      return false;
    }
    return true;
  }
}
exports.default = Ticket;
Ticket.label = 'Ticket';
Ticket.icon = 'ticket';
Ticket.defaultSort = '-createdAt';
Ticket.defaultColumns = 'title userId sessionId state createdAt';
Ticket.noupdate = true;
Ticket.nocreate = true;
Ticket.api = {
  show: 1,
  create: 1
};
Ticket.fields = {
  title: {
    label: 'Title',
    type: String,
    private: true
  },
  userId: {
    label: 'User ID',
    type: String,
    private: true
  },
  sessionId: {
    label: 'Session ID',
    type: String,
    private: true
  },
  state: {
    label: 'State',
    type: 'select',
    default: false,
    boolean: true,
    options: [{
      label: 'Pending',
      value: false
    }, {
      label: 'Done',
      value: true
    }]
  },
  result: {
    label: 'Result',
    type: Object,
    default: null
  },
  createdAt: {
    label: 'Created At',
    type: Date,
    private: true
  }
};