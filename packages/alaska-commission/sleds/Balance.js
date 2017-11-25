'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _User = require('alaska-user/models/User');

var _User2 = _interopRequireDefault(_User);

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Balance extends _alaska.Sled {
  /**
   * @param params
   *        params.commission
   *        [params.user]
   */
  async exec(params) {
    let user = params.user;
    let commission = params.commission;

    if (commission.state) {
      return commission.toObject();
    }

    try {
      if (!user) {
        // $Flow findById
        user = await _User2.default.findById(commission.user);
      }

      if (!user) {
        throw new Error('can not find user');
      }

      let currency = _alaskaBalance2.default.currenciesMap[commission.currency];
      if (!currency) {
        throw new Error('can not find currency');
      }

      if (!_User2.default.fields[commission.currency]) {
        throw new Error(`can not find User.${commission.currency} field`);
      }

      await user._[commission.currency].income(commission.amount, commission.title, 'commission');

      commission.state = 1;
      commission.balancedAt = new Date();
    } catch (error) {
      commission.state = -1;
      commission.error = error.message;
    }
    await commission.save();
    return commission.toObject();
  }
}
exports.default = Balance;