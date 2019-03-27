"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const xml2js = require("xml2js");
function decrypt(encryptedData, key, iv = '') {
    let decipher = crypto.createDecipheriv('aes-256-ecb', key, iv);
    decipher.setAutoPadding(true);
    let decoded = decipher.update(encryptedData, 'base64', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
}
exports.decrypt = decrypt;
function md5(str, encoding = 'utf8') {
    return crypto.createHash('md5').update(str, encoding).digest('hex');
}
exports.md5 = md5;
function sha256(str, key, encoding = 'utf8') {
    return crypto.createHmac('sha256', key).update(str, encoding).digest('hex');
}
exports.sha256 = sha256;
function encryptRSA(key, hash) {
    return crypto.publicEncrypt(key, Buffer.from(hash)).toString('base64');
}
exports.encryptRSA = encryptRSA;
function checkXML(str) {
    let reg = /^(<\?xml.*\?>)?(\r?\n)*<xml>(.|\r?\n)*<\/xml>$/i;
    return reg.test(str.trim());
}
exports.checkXML = checkXML;
function getFullDate() {
    const str = new Date();
    let YYYY = str.getFullYear();
    let MM = (`00${str.getMonth() + 1}`).substr(-2);
    let DD = (`00${str.getDate()}`).substr(-2);
    return YYYY + MM + DD;
}
exports.getFullDate = getFullDate;
function toQueryString(obj) {
    return Object.keys(obj)
        .filter((key) => key !== 'sign' && obj[key] && obj[key] !== '')
        .sort()
        .map((key) => `${key}=${obj[key]}`)
        .join('&');
}
exports.toQueryString = toQueryString;
function buildXML(params, rootName = 'xml') {
    const opt = {
        xmldec: null,
        rootName,
        allowSurrogateChars: true,
        cdata: true
    };
    return new xml2js.Builder(opt).buildObject(params);
}
exports.buildXML = buildXML;
function parseXML(xml) {
    return new Promise((resolve, reject) => {
        const opt = { trim: true, explicitArray: false, explicitRoot: false };
        xml2js.parseString(xml, opt, (err, res) => {
            if (err) {
                return reject(new Error('XMLDataError'));
            }
            return resolve(res || {});
        });
    });
}
exports.parseXML = parseXML;
