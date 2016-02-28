/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

class Session {
  constructor(ctx, obj) {
    this._ctx = ctx;
    if (!obj) {
      this.isNew = true;
    } else {
      for (let k in obj) {
        this[k] = obj[k];
      }
    }
  }

  get length() {
    return Object.keys(this.toJSON()).length;
  }

  toJSON() {
    let me = this;
    let obj = {};
    Object.keys(this).forEach(key=> {
      if (key === 'isNew' || key[0] === '_') {
        return;
      }
      obj[key] = me[key];
    });
    return obj;
  }

  isChanged(prev) {
    if (!prev) {
      return true;
    }
    this._json = JSON.stringify(this);
    return this._json !== prev;
  }

}

module.exports = Session;
