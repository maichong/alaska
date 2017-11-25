'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _AppUpdate = require('../models/AppUpdate');

var _AppUpdate2 = _interopRequireDefault(_AppUpdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Update extends _alaska.Sled {
  async exec() {
    const serviceModules = _alaska2.default.modules.services[_alaska2.default.main.id];
    if (!serviceModules || !serviceModules.updates) return;

    // $Flow
    let records = await _AppUpdate2.default.find();
    let recordsMap = {};
    records.forEach(record => {
      recordsMap[record.key] = record;
    });

    // eslint-disable-next-line
    for (let key in serviceModules.updates) {
      if (recordsMap[key]) continue;

      console.log('Apply update script ', key);

      let mod = serviceModules.updates[key];
      if (!(typeof mod === 'function')) {
        console.log(`Update script "${key}" must export a async function as default!`);
        process.exit();
      }

      await mod();
      await new _AppUpdate2.default({ key }).save();
    }
  }
}
exports.default = Update;