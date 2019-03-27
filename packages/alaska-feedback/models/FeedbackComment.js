"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class FeedbackComment extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
FeedbackComment.label = 'Feedback Comment';
FeedbackComment.icon = 'comments-o';
FeedbackComment.titleField = 'content';
FeedbackComment.defaultColumns = 'feedback user fromAdmin content createdAt';
FeedbackComment.defaultSort = '-createdAt';
FeedbackComment.fields = {
    feedback: {
        label: 'Feedback',
        type: 'relationship',
        ref: 'Feedback',
        index: true,
        required: true
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        optional: 'alaska-user'
    },
    fromAdmin: {
        label: 'From Admin',
        type: Boolean
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    content: {
        label: 'Content',
        type: String,
        multiLine: true,
        required: true,
        disabled: [{
                ability: 'alaska-feedback.Feedback.reply'
            }]
    }
};
exports.default = FeedbackComment;
