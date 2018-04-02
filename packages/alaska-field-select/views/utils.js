'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOptionValue = getOptionValue;
function getOptionValue(opt) {
  if (Array.isArray(opt)) {
    return ''; //ERROR
  }
  if (opt && typeof opt === 'object') {
    return String(opt.value);
  }
  return String(opt);
}