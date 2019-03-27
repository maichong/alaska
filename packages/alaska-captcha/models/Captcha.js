"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const __1 = require("..");
class Captcha extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (this.type === 'sms' && !this.sms)
            __1.default.error('Please select a sms template');
        if (this.type === 'email' && !this.email)
            __1.default.error('Please select a email template');
        if (!this.anonymous && !this.userField)
            __1.default.error('userField is required');
    }
}
Captcha.label = 'Captcha';
Captcha.icon = 'lock';
Captcha.titleField = 'title';
Captcha.defaultColumns = '_id title anonymous type length sms email lifetime';
Captcha.defaultSort = '_id';
Captcha.fields = {
    _id: {
        type: String,
        required: true
    },
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    anonymous: {
        label: 'Anonymous',
        type: Boolean
    },
    userField: {
        label: 'User field',
        type: String,
        hidden: 'anonymous'
    },
    type: {
        label: 'Type',
        type: 'select',
        default: 'sms',
        options: [{
                label: 'SMS',
                value: 'sms',
                optional: 'alaska-sms'
            }, {
                label: 'Email',
                value: 'email',
                optional: 'alaska-sms'
            }]
    },
    sms: {
        label: 'SMS Template',
        type: 'relationship',
        ref: 'alaska-sms.Sms',
        optional: 'alaska-sms',
        hidden: {
            type: {
                $ne: 'sms'
            }
        }
    },
    email: {
        label: 'Email Template',
        type: 'relationship',
        ref: 'alaska-email.Email',
        optional: 'alaska-email',
        hidden: {
            type: {
                $ne: 'email'
            }
        }
    },
    characters: {
        label: 'Characters',
        type: String,
        default: '0123456789ABCDEFGHJKMNPQRSTWXYZ'
    },
    length: {
        label: 'Length',
        type: Number,
        default: 6
    },
    lifetime: {
        label: 'Life Time',
        type: Number,
        default: 1800,
        addonAfter: 'seconds'
    }
};
exports.default = Captcha;
