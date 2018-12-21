import Config from './config';
import Service from './service';
import Plugin from './plugin';
import Extension from './extension';
import Loader from './loader';
import Driver from './driver';
import { NormalError } from './errors';

export {
  Config,
  Service,
  Plugin,
  Extension,
  Loader,
  Driver,
  NormalError
};

/**
 * 接口关闭
 */
export const CLOSED = 0;

/**
 * 公开接口
 */
export const PUBLIC = 1;

/**
 * 接口需要登录
 */
export const AUTHENTICATED = 2;
