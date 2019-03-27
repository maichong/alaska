"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Feedback extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.title) {
            this.title = (this.content || '').substr(0, 20);
        }
        this.newComment = null;
    }
}
Feedback.label = 'Feedback';
Feedback.icon = 'comment';
Feedback.titleField = 'title';
Feedback.defaultColumns = '_id title user content createdAt';
Feedback.defaultSort = '-createdAt';
Feedback.relationships = {
    comments: {
        title: 'Comments',
        ref: 'FeedbackComment',
        path: 'feedback',
        protected: true,
        options: {
            sort: 'createdAt'
        }
    }
};
Feedback.populations = {
    lastComment: {
        auto: true
    }
};
Feedback.api = {
    paginate: 2,
    list: 2,
    show: 2,
    create: 2
};
Feedback.actions = {
    reply: {
        icon: 'reply',
        tooltip: 'Reply',
        title: 'Reply',
        sled: 'Reply',
        color: 'success',
        hidden: '!_id',
        disabled: '!newComment',
        post: 'js:location.reload()'
    }
};
Feedback.groups = {
    reply: {
        title: 'Reply',
        full: true,
    }
};
Feedback.fields = {
    title: {
        label: 'Title',
        type: String
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        optional: 'alaska-user'
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    content: {
        label: 'Content',
        type: String,
        multiLine: true,
        required: true
    },
    lastComment: {
        label: 'Last Comment',
        type: 'relationship',
        ref: 'FeedbackComment'
    },
    newComment: {
        label: 'Reply',
        type: String,
        multiLine: true,
        private: true,
        nolabel: true,
        horizontal: false,
        group: 'reply',
        hidden: '!_id',
        placeholder: 'Please enter the content to reply...'
    }
};
exports.default = Feedback;
