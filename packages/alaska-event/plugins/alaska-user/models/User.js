"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = require("../../../models/Event");
exports.default = {
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
        async createEvent(data) {
            let event = new Event_1.default(data);
            event.user = this;
            await event.save({ session: this.$session() });
            this.lastEvent = event._id;
            await this.save();
            return event;
        },
        async readEvent(event) {
            let e = event;
            if (!event.save) {
                e = await Event_1.default.findById(event).session(this.$session());
            }
            if (!e)
                throw new Error('Can not find event');
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
