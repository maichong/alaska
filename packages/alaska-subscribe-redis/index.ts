import * as redis from 'redis';
import * as Debugger from 'debug';
import { Service } from 'alaska';
import SubscribeDriver from 'alaska-subscribe';
import { RedisSubscribeDriverConfig } from 'alaska-subscribe-redis';

const debug = Debugger('alaska-subscribe-redis');

export default class RedisSubscribeDriver<T> extends SubscribeDriver<T, RedisSubscribeDriverConfig, redis.RedisClient> {
  channel: string;
  _driver: redis.RedisClient;
  _subscribed: boolean;
  _timer: NodeJS.Timeout;
  _messages: Object[];
  _onMessage: Function | null;
  _listener: any;
  constructor(config: RedisSubscribeDriverConfig, service: Service) {
    super(config, service);
    this.channel = config.channel;
    this._driver = redis.createClient(config);
    this._subscribed = false;
    this._messages = [];
    this._onMessage = null;//message callback
    this._listener = null;
  }

  /**
   * 发布消息
   * @param {any} message
   */
  publish(message: T): Promise<void> {
    debug('publish', message);
    if (this._subscribed) {
      return Promise.reject(new Error('can not publish message with subscribed driver.'));
    }
    return new Promise((resolve, reject) => {
      this._driver.publish(this.channel, JSON.stringify(message), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 订阅消息
   * @returns {Promise<void>}
   */
  subscribe(): Promise<void> {
    debug('subscribe', this.channel);
    if (this._subscribed) {
      return Promise.reject(new Error('driver has already subscribed.'));
    }
    this._subscribed = true;
    return new Promise((resolve, reject) => {
      this._driver.subscribe(this.channel, (error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      this._listener = (channel: string, message: string) => {
        try {
          let json = JSON.parse(message);
          this._messages.push(json);
          if (this._onMessage) {
            this._onMessage();
          }
        } catch (e) {
          //JSON 解析失败
        }
      };
      this._driver.on('message', this._listener);
    });
  }

  /**
   * 从频道读取一条消息
   * @param {number} [timeout] 超时时间,单位毫秒,默认为Infinity,超时后返回null
   * @returns {Promise<Object|null>}
   */
  read(timeout?: number): Promise<T | null> {
    debug('read');
    if (!this._subscribed) {
      return Promise.reject(new Error('the driver is not subscribed.'));
    }
    if (this._messages.length) {
      return Promise.resolve(<T> this._messages.shift());
    }
    if (typeof timeout === 'undefined') {
      timeout = Infinity;
    }
    return new Promise((resolve) => {
      let timer: NodeJS.Timeout;
      this._onMessage = () => {
        this._onMessage = null;
        if (timer) {
          clearTimeout(timer);
        }
        resolve(<T> this._messages.shift());
      };
      if (timeout && timeout !== Infinity) {
        timer = global.setTimeout(() => {
          if (timer) {
            clearTimeout(timer);
          }
          this._onMessage = null;
          //超时后返回null
          resolve(null);
        }, timeout);
        this._timer = timer;
      }
    });
  }

  /**
   * 只订阅一次信息
   * @param {number} timeout 超时时间,单位毫秒,默认为Infinity,超时后返回null
   * @returns {Promise<Object|null>}
   */
  once(timeout?: number): Promise<T | null> {
    debug('once');
    if (this._subscribed) {
      return Promise.reject(new Error('driver has already subscribed.'));
    }
    this._subscribed = true;
    if (typeof timeout === 'undefined') {
      timeout = Infinity;
    }
    return new Promise((resolve, reject) => {
      this._driver.subscribe(this.channel, (error) => {
        if (error) {
          reject(error);
        }
      });
      this._listener = (channel: string, message: string) => {
        try {
          let json = JSON.parse(message);
          this.cancel();
          resolve(json);
        } catch (e) {
          //JSON 解析失败
        }
      };
      this._driver.on('message', this._listener);

      if (timeout && timeout !== Infinity) {
        this._timer = global.setTimeout(() => {
          this.cancel();
          //超时后返回null
          resolve(null);
        }, timeout);
      }
    });
  }

  /**
   * 取消订阅
   */
  cancel(): Promise<void> {
    debug('cancel');
    if (this._timer) {
      clearTimeout(this._timer);
      // eslint-disable-next-line
      this._timer = undefined;
    }
    if (!this._subscribed) {
      return Promise.resolve();
    }
    this._subscribed = false;
    return new Promise((resolve, reject) => {
      this._driver.unsubscribe(this.channel, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      if (this._listener) {
        this._driver.removeListener('message', this._listener);
        this._listener = null;
      }
    });
  }

  free() {
    this.cancel();
    this._messages = [];
    this._onMessage = null;//message callback
  }

  destroy() {
    let destroy = () => {
      this._messages = [];
      this._onMessage = null;
      this._driver = null;
    };
    this.cancel().then(destroy, destroy);
  }
}
