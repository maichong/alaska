"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Email extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Email.label = 'Email';
Email.icon = 'envelope';
Email.titleField = 'title';
Email.defaultColumns = '_id title subject';
Email.defaultSort = '-sort';
Email.searchFields = 'title subject content';
Email.actions = {
    test: {
        title: 'Test Send',
        sled: 'Test',
        style: 'success',
        hidden: {
            $ne: 'testTo'
        }
    }
};
Email.fields = {
    _id: {
        type: String,
        required: true
    },
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    subject: {
        label: 'Subject',
        type: String
    },
    driver: {
        label: 'Driver',
        type: 'select',
        default: 'default',
        options: []
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    testTo: {
        label: 'Test Send To',
        type: String,
        private: true
    },
    testData: {
        label: 'Test Template Variables',
        type: Object,
        private: true,
        default: {}
    },
    content: {
        label: 'Content',
        type: 'html'
    }
};
exports.default = Email;
