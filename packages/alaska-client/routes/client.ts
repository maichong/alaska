import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import Client from '../models/Client';
import service from '..';

interface CreateBody {
  deviceId: string;
  platform: string;
}

export default function (router: Router) {
  router.post('/client', async (ctx: Context) => {
    const { headers } = ctx.request;
    let id: string = headers['Client-ID'];
    let token: string = headers['Client-Token'];
    let client: Client = null;
    if (id) {
      client = await Client.findById(id);
    }
    if (!client) {
      client = new Client();
    }
    // @ts-ignore
    let requestBody = ctx.request.body as CreateBody;
    let body = ctx.state.body || requestBody;
    if (body.deviceId) {
      client.set('uuid', body.deviceId);
    }
    if (body.platform) {
      client.set('platform', body.platform);
    }
    await client.save();
    ctx.body = client.data();
  });
}
