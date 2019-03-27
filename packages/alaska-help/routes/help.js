"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Help_1 = require("../models/Help");
function default_1(router) {
    router.get('/help', async (ctx) => {
        let results = await Help_1.default.find({
            activated: true
        });
        if (!results || !results.length) {
            ctx.body = [];
            return;
        }
        const map = {};
        results = results.map((item) => {
            let help = item.data();
            help.helps = [];
            map[help.id] = help;
            return help;
        });
        results.forEach((help) => {
            if (help.parent && map[help.parent]) {
                map[help.parent].helps.push(help);
            }
        });
        ctx.body = results.filter((help) => !help.parent);
    });
}
exports.default = default_1;
