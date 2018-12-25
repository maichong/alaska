import { ObjectMap, Service, ServiceOptions } from 'alaska';
import { Context } from 'alaska-http';
import Keyword from './models/Keyword';

class GoodsService extends Service {
  _keywords: ObjectMap<number> = {};
  _timer: NodeJS.Timer;

  constructor(options: ServiceOptions) {
    super(options);
    this.resolveConfig().then(() => {
      this.main.post('initHttp', () => {
        this.main.app.use(async (ctx: Context, next: Function) => {
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

  updateRecords = async () => {
    this._timer = null;
    for (let search in this._keywords) {
      let hot = this._keywords[search];
      delete this._keywords[search];
      let record = await Keyword.findOneAndUpdate(
        { title: search },
        { $inc: { hot } },
        // @ts-ignore returnOriginal
        { upsert: true, returnOriginal: false }
      );
      if (!record.createdAt) {
        record.createdAt = new Date();
        record.save();
      }
    }
  };
}

export default new GoodsService({
  id: 'alaska-keyword'
});
