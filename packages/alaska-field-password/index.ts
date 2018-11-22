import { Field } from 'alaska-model';
import * as bcrypt from 'bcryptjs';

export default class PasswordField extends Field {
  static fieldName = 'Password';
  static plain = String;
  static defaultOptions = {
    cell: 'PasswordFieldCell',
    view: 'PasswordFieldView'
  };

  workFactor: number;

  initSchema() {
    let field = this;
    let schema = this._schema;
    field.workFactor = field.workFactor || 10;
    let NEED_HASHING = `__${field.path}_needs_hassing`;
    let options: any = {
      type: String,
      required: Boolean,
      set(password: string) {
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
    this.underscoreMethod('set', function (value: string) {
      this.set(field.path, value);
      this[NEED_HASHING] = false;
    });

    /**
     * 比较密码
     * @params {string} candidate
     */
    this.underscoreMethod('compare', function (candidate: string) {
      let record = this;
      return new Promise((resolve, reject) => {
        let value = record.get(field.path);
        if (!value) {
          resolve(false);
          return;
        }
        bcrypt.compare(candidate, record.get(field.path), (error, res) => {
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
      // @ts-ignore record[NEED_HASHING]
      if (!record.isModified(field.path) || !record[NEED_HASHING]) {
        next();
        return;
      }

      if (!record.get(field.path)) {
        // eslint-disable-next-line
        record.set(field.path, undefined);
        next();
        return;
      }

      bcrypt.genSalt(field.workFactor, (err, salt) => {
        if (err) {
          next(err);
          return;
        }
        bcrypt.hash(record.get(field.path), salt, (error, hash) => {
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

  parse(value: any): null | string {
    if (typeof value === 'string') {
      return value;
    } else if (value === null || typeof value === 'undefined') {
      return null;
    }
    return String(value);
  }
}
