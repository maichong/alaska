"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const __1 = require("..");
class Sms extends alaska_model_1.Model {
    static preRegister() {
        let locales = __1.default.main.config.get('locales');
        if (locales && locales.length > 1) {
            let SmsModel = Sms;
            SmsModel.fields.content.help = 'Default';
            locales.forEach((locale) => {
                SmsModel.fields[`content_${locale.replace('-', '_')}`] = {
                    label: 'Content',
                    type: String,
                };
            });
        }
    }
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Sms.label = 'SMS';
Sms.icon = 'comment';
Sms.titleField = 'title';
Sms.defaultColumns = '_id title content createdAt';
Sms.defaultSort = '_id';
Sms.fields = {
    _id: {
        type: String,
        required: true
    },
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    driver: {
        label: 'Driver',
        type: 'select',
        options: __1.default.getDriverOptionsAsync()
    },
    content: {
        label: 'Content',
        type: String,
        required: true,
        multiLine: true
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Sms;
