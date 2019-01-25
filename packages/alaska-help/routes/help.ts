import Help from '../models/Help';
import { Context, Router } from 'alaska-http';
import { ObjectMap } from '@samoyed/types';

export default function (router: Router) {
  router.get('/help', async (ctx: Context) => {
    let results = await Help.find({
      activated: true
    });
    if (!results || !results.length) {
      ctx.body = [];
      return;
    }
    const map: ObjectMap<Help & { helps: Help[] }> = {};
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
