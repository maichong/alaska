"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setStorage(key, value) {
    if (!window.localStorage)
        return;
    value = JSON.stringify(value);
    window.localStorage.setItem(key, value);
}
exports.setStorage = setStorage;
function getStorage(key) {
    if (!window.localStorage)
        return null;
    let value = window.localStorage.getItem(key);
    if (value) {
        try {
            return JSON.parse(value);
        }
        catch (e) {
        }
    }
    return null;
}
exports.getStorage = getStorage;
function removeStorage(key) {
    if (!window.localStorage)
        return;
    window.localStorage.removeItem(key);
}
exports.removeStorage = removeStorage;
