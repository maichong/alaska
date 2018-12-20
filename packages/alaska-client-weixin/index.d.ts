import { Plugin } from 'alaska';
import * as libwx from 'libwx';

declare module 'alaska-client' {
  interface ClientService {
    wx: libwx.Weixin;
  }
}

export default class WeixinClientPlugin extends Plugin {
}
