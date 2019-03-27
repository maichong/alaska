"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const Keyword_1 = require("./models/Keyword");
class KeywordService extends alaska_1.Service {
    constructor(options) {
        super(options);
        this._keywords = {};
        this.updateRecords = async () => {
            this._timer = null;
            for (let search of Object.keys(this._keywords)) {
                let hot = this._keywords[search];
                delete this._keywords[search];
                let record = await Keyword_1.default.findOneAndUpdate({ title: search }, { $inc: { hot } }, { upsert: true, returnOriginal: false });
                if (!record.createdAt) {
                    record.createdAt = new Date();
                    record.save();
                }
            }
        };
        this.resolveConfig().then(() => {
            this.main.post('initHttp', () => {
                this.main.app.use(async (ctx, next) => {
                    if (ctx.method === 'GET' && ctx.query._search) {
                        let search = ctx.query._search.trim();
                        if (search) {
                            if (typeof this._keywords[search] !== 'number') {
                                this._keywords[search] = 0;
                            }
                            this._keywords[search] += 1;
                            if (!this._timer) {
                                this._timer = setTimeout(this.updateRecords, 2000);
                            }
                        }
                    }
                    await next();
                });
            });
        });
    }
}
exports.default = new KeywordService({
    id: 'alaska-keyword'
});
