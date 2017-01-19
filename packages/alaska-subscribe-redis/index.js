// @flow

import redis from 'redis';

export default class RedisSubscribeDriver {

  /**
   * @param {Object} options Redis连接设置
   */
  constructor(options: Object) {
    this.channel = options.channel;
    this.options = options;
    this._driver = redis.createClient(options);
    this._subscribed = false;
    this._timer = 0;
    this._messages = [];
    this._onMessage = null;//message callback
    this._listener = null;
  }

  channel: Object;
  options: Object;
  _driver: Object;
  _subscribed: boolean;
  _timer: number;
  _messages: [];
  _onMessage: ?Function;
  _listener: ?Function;

  /**
   * 发布信息
   * @param {object} message
   */
  publish(message: Object): Promise<void> {
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
   * [async] 订阅信息
   */
  subscribe() {
    if (this._subscribed) {
      return Promise.reject('driver has already subscribed.');
    }
    this._subscribed = true;
    return new Promise((resolve, reject) => {
      this._driver.subscribe(this.channel, (error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
      this._listener = (channel, message) => {
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
   * [async] 从频道读取一条消息
   * @param {number} timeout 超时时间,单位毫秒,默认为Infinity,超时后返回null
   * @returns {*}
   */
  read(timeout: ?number) {
    if (!this._subscribed) {
      return Promise.reject('the driver is not subscribed.');
    }
    if (this._messages.length) {
      return Promise.resolve(this._messages.shift());
    }
    if (timeout === undefined) {
      timeout = Infinity;
    }
    return new Promise((resolve) => {
      let timer = 0;
      this._onMessage = () => {
        this._onMessage = null;
        if (timer) {
          clearTimeout(timer);
        }
        resolve(this._messages.shift());
      };
      if (timeout && timeout !== Infinity) {
        timer = this._timer = setTimeout(() => {
          if (timer) {
            clearTimeout(timer);
          }
          this._onMessage = null;
          //超时后返回null
          resolve(null);
        }, timeout);
      }
    });
  }

  /**
   * 只订阅一次信息
   * @param {number} timeout 超时时间,单位毫秒,默认为Infinity,超时后返回null
   */
  once(timeout: ?number) {
    if (this._subscribed) {
      return Promise.reject('driver has already subscribed.');
    }
    this._subscribed = true;
    if (timeout === undefined) {
      timeout = Infinity;
    }
    return new Promise((resolve, reject) => {
      this._driver.subscribe(this.channel, (error) => {
        if (error) {
          reject(error);
        }
      });
      this._listener = (channel, message) => {
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
        this._timer = setTimeout(() => {
          this.cancel();
          //超时后返回null
          resolve(null);
        }, timeout);
      }
    });
  }

  /**
   * [async] 取消订阅
   */
  cancel() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = 0;
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

  /**
   * 释放当前所有任务,进入空闲状态
   */
  free() {
    this.cancel();
    this._messages = [];
    this._onMessage = null;//message callback
  }

  /**
   * 销毁
   */
  destroy() {
    let destroy = () => {
      this._messages = [];
      this._onMessage = null;
      // $Flow  销毁_driver
      this._driver = null;
    };
    this.cancel().then(destroy, destroy);
  }

}
