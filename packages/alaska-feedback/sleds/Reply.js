"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const FeedbackComment_1 = require("../models/FeedbackComment");
class Reply extends alaska_sled_1.Sled {
    async exec(params) {
        let record = params.record;
        let user = params.admin;
        let content = params.body.newComment;
        let comment = new FeedbackComment_1.default({
            user,
            content,
            feedback: record._id
        });
        if (params.admin) {
            comment.fromAdmin = true;
        }
        await comment.save({ session: this.dbSession });
        record.lastComment = comment._id;
        await record.save({ session: this.dbSession });
        return record;
    }
}
exports.default = Reply;
