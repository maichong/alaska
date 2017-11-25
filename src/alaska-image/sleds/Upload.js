// @flow

import alaska, { Sled } from 'alaska';
import akita from 'akita-node';
import mime from 'mime-types';
import path from 'path';
import Image from '../models/Image';

const client = akita.resolve('alaska-image');

export default class Upload extends Sled {
  async exec(params: Object) {
    let {
      file, data, url, user, headers, filename, ext, mimeType, returnImage
    } = params;

    if (!file && data) {
      if (Buffer.isBuffer(data)) {
        //buffer
        file = data;
      } else if (typeof data === 'string') {
        //base64
        file = Buffer.from(data, 'base64');
      }
    }

    if (!file && url) {
      let res = await client.get(url, { headers }).response();
      file = await res.buffer();
      if (!filename) {
        filename = path.basename(url);
      }
      if (!mimeType) {
        mimeType = mime.lookup(url);
      }
    }
    if (!file) alaska.error('No file found');
    if (filename) {
      // $Flow file 类型不固定
      file.filename = filename;
    }
    if (ext) {
      // $Flow file 类型不固定
      file.ext = ext;
    }
    if (mimeType) {
      // $Flow file 类型不固定
      file.mimeType = mimeType;
    }
    let record = new Image({ user });
    await record._.pic.upload(file);
    if (record.pic._id) {
      record._id = record.pic._id;
    }
    await record.save();
    return returnImage ? record.pic : record;
  }
}
