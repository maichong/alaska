"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    prefix: '',
    services: {
        'alaska-settings': {}
    },
    cache: {
        type: 'alaska-cache-lru',
        maxAge: 5 * 60 * 1000
    }
};
