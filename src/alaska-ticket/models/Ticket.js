// @flow

import { Model } from 'alaska';
import type User from 'alaska-user/models/User';

export default class Ticket extends Model {
  static label = 'Ticket';
  static icon = 'ticket';
  static defaultSort = '-createdAt';
  static defaultColumns = 'title userId sessionId state createdAt';
  static noupdate = true;
  static nocreate = true;

  static api = {
    show: 1,
    create: 1
  };

  static fields = {
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

  user: ?User;
  title: string;
  userId: string;
  sessionId: string;
  state: Object;
  result: Object;
  createdAt: Date;

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
  verify(ctx: Alaska$Context) {
    if (this.userId && (!ctx.user || ctx.user.id !== this.userId)) {
      return false;
    }
    if (!this.userId && this.sessionId && ctx.sessionId !== this.sessionId) {
      return false;
    }
    return true;
  }
}
