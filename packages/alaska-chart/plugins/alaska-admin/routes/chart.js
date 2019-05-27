"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_user_1 = require("alaska-user");
const Chart_1 = require("../../../models/Chart");
function default_1(router) {
    router.get('/chart', async (ctx) => {
        if (!ctx.state.ignoreAuthorization) {
            if (!ctx.user)
                ctx.throw(401);
            if (!await alaska_user_1.default.hasAbility(ctx.user, 'admin'))
                ctx.throw(403);
        }
        let place = ctx.query._place;
        let chart = ctx.query._chart;
        if (!place && !chart)
            ctx.throw(400, '_place or _chart is required!');
        if (place) {
            let charts = await Chart_1.default.find({ place }).sort(Chart_1.default.defaultSort);
            ctx.body = await Promise.all(charts.map((c) => Chart_1.default.getChartOption(c, ctx)));
            return;
        }
        if (_.isEmpty(chart.series))
            ctx.throw(400, 'chart.series is required!');
        ctx.body = [await Chart_1.default.getChartOption(chart, ctx)];
    });
    router.get('/chart/:id', async (ctx) => {
        if (!ctx.state.ignoreAuthorization) {
            if (!ctx.user)
                ctx.throw(401);
            if (!await alaska_user_1.default.hasAbility(ctx.user, 'admin'))
                ctx.throw(403);
        }
        let chart = await Chart_1.default.findById(ctx.params.id);
        if (!chart)
            ctx.throw(404);
        ctx.body = await Chart_1.default.getChartOption(chart, ctx);
    });
}
exports.default = default_1;
