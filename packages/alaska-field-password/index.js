'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _bcryptjs = require('bcryptjs');

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PasswordField extends _alaska.Field {

  initSchema() {
    let field = this;
    let schema = this._schema;
    field.workFactor = field.workFactor || 10;
    let NEED_HASHING = '__' + field.path + '_needs_hassing';
    let options = {
      type: String,
      required: Boolean,
      set(password) {
        this[NEED_HASHING] = true;
        return password;
      }
    };
    if (field.required) {
      options.required = true;
    }
    schema.path(field.path, options);
    this.underscoreMethod('data', function () {
      return this.get(field.path) ? '' : null;
    });
    this.underscoreMethod('set', function (value) {
      this.set(field.path, value);
      this[NEED_HASHING] = false;
    });

    /**
     * 比较密码
     * @params {string} candidate
     */
    this.underscoreMethod('compare', function (candidate) {
      let record = this;
      return new Promise((resolve, reject) => {
        let value = record.get(field.path);
        if (!value) {
          resolve(false);
          return;
        }
        _bcryptjs2.default.compare(candidate, record.get(field.path), (error, res) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(res);
        });
      });
    });

    schema.pre('save', function (next) {
      let record = this;
      if (!record.isModified(field.path) || !record[NEED_HASHING]) {
        next();
        return;
      }

      if (!record.get(field.path)) {
        record.set(field.path, undefined);
        next();
        return;
      }

      _bcryptjs2.default.genSalt(field.workFactor, (err, salt) => {
        if (err) {
          next(err);
          return;
        }
        _bcryptjs2.default.hash(record.get(field.path), salt, (error, hash) => {
          if (error) {
            next(err);
            return;
          }
          record.set(field.path, hash);
          next();
        });
      });
      // end of save
    });
  }
}
exports.default = PasswordField;
PasswordField.plain = String;
PasswordField.defaultOptions = {
  cell: 'PasswordFieldCell',
  view: 'PasswordFieldView'
};