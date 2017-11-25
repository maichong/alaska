'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Help = require('../models/Help');

var _Help2 = _interopRequireDefault(_Help);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function (ctx) {
  let results = await _Help2.default.find({
    activated: true
  });

  if (!results || !results.length) {
    ctx.body = [];
    return;
  }

  const map = {};
  results = results.map(item => {
    let help = item.data();
    help.helps = [];
    map[help.id] = help;
    return help;
  });

  results.forEach(help => {
    if (help.parent && map[help.parent]) {
      map[help.parent].helps.push(help);
    }
  });

  ctx.body = results.filter(help => !help.parent);
};