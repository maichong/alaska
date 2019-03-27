"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getOptionValue(opt) {
    if (Array.isArray(opt)) {
        return '';
    }
    if (opt && typeof opt === 'object') {
        return String(opt.value);
    }
    return String(opt);
}
exports.getOptionValue = getOptionValue;
