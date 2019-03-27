"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseAcceptLanguage(header) {
    if (!header) {
        return [];
    }
    return header.split(',')
        .map((item) => {
        let lang = item.split(';q=');
        if (lang.length < 2) {
            return [item, 1];
        }
        return [lang[0], parseFloat(lang[1]) || 0];
    })
        .filter((lang) => lang[1] > 0)
        .sort((a, b) => (a[1] < b[1] ? 1 : -1))
        .map((lang) => lang[0]);
}
exports.parseAcceptLanguage = parseAcceptLanguage;
