import * as crypto from 'crypto';
import * as _ from 'lodash';
import * as xml2js from 'xml2js';
import { ObjectMap } from 'alaska';

export function decrypt(encryptedData: any, key: any, iv: string = ''): string {
  let decipher = crypto.createDecipheriv('aes-256-ecb', key, iv);
  decipher.setAutoPadding(true);
  let decoded = decipher.update(encryptedData, 'base64', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}

export function md5(str: string, encoding: crypto.Utf8AsciiLatin1Encoding = 'utf8'): string {
  return crypto.createHash('md5').update(str, encoding).digest('hex');
}

export function sha256(str: string, key: any, encoding: crypto.Utf8AsciiLatin1Encoding = 'utf8'): string {
  return crypto.createHmac('sha256', key).update(str, encoding).digest('hex');
}

export function encryptRSA(key: any, hash: string): string {
  return crypto.publicEncrypt(key, Buffer.from(hash)).toString('base64');
}

export function checkXML(str: string): boolean {
  let reg = /^(<\?xml.*\?>)?(\r?\n)*<xml>(.|\r?\n)*<\/xml>$/i;
  return reg.test(str.trim());
}

export function toQueryString(obj: ObjectMap<any>): string {
  return Object.keys(obj)
    .filter((key) => key !== 'sign' && obj[key] && obj[key] !== '')
    .sort()
    .map((key) => `${key}=${obj[key]}`)
    .join('&');
}

export function data2xml(params: any, rootName: string = 'xml'): string {
  const opt = {
    // @ts-ignore
    xmldec: null,
    rootName,
    allowSurrogateChars: true,
    cdata: true
  };
  return new xml2js.Builder(opt).buildObject(params);
}

export function xml2data(xml: string | Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    const opt = { trim: true, explicitArray: false, explicitRoot: false };
    xml2js.parseString(xml, opt, (error: Error, result: any) => {
      if (error) {
        return reject(new Error('XMLDataError'));
      }
      let data: any = {};
      for (let key of _.keys(result.xml)) {
        let value = result.xml[key];
        data[key] = value && value.length === 1 ? value[0] : value;
      }
      resolve(data);
    });
  });
}
