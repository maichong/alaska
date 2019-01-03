import { Sled } from 'alaska-sled';
import * as Path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as moment from 'moment';
import * as imageSize from 'image-size';
import * as isStream from 'is-stream';
import * as isSvg from 'is-svg';
import * as fileType from 'file-type';
import Image from '../models/Image';
import service, { CreateParams } from '..';

interface ImageInfo {
  width: number;
  height: number;
  type: string;
}

const stat = util.promisify(fs.stat);
// @ts-ignore
const imageSizeAsync: (path: string) => Promise<ImageInfo> = util.promisify(imageSize);

export default class Create extends Sled<CreateParams, Image> {
  async exec(params: CreateParams): Promise<Image> {
    let { driver, body, ctx, file, data } = params;
    body = body || {};
    driver = driver || body.driver || 'default';
    if (!service.drivers.hasOwnProperty(driver)) {
      service.error('Image storage driver not found!');
    }
    let driverConfig = service.drivers[driver];
    if (!file && !data) {
      if (!ctx) service.error('image file is required');
      if (!ctx.files || !ctx.files.file) service.error('upload file is required');
      // @ts-ignore ctx.files.file 只允许单个文件，不能是数组
      file = ctx.files.file;
    }

    let image = new Image({
      name: params.name
    });

    let user = params.user || params.admin;
    if (user) {
      image.user = user._id;
    }

    let filePath: string;
    if (typeof file === 'string') {
      filePath = file;
      file = fs.createReadStream(file);
    } else if (isStream.readable(file)) {
      // @ts-ignore 如果是上传文件，那么存在 file.path
      filePath = file.path;
      if (!image.name) {
        // @ts-ignore 如果是上传文件，那么存在 file.filename
        image.name = file.filename;
      }
    }
    if (!image.name && filePath) {
      image.name = Path.basename(filePath);
    }

    if (image.name) {
      image.ext = Path.extname(image.name).toLowerCase().replace('.', '').replace('jpeg', 'jpg');
    }
    if (data && !image.ext) {
      let info = fileType(data);
      if (info.ext) {
        image.ext = info.ext;
      } else if (isSvg(data)) {
        image.ext = 'svg';
      }
    }

    if (!driverConfig.allowed.includes(image.ext)) service.error('Invalid image format');

    if (data) {
      image.size = data.length;
    }
    if (!image.size && filePath) {
      let info = await stat(filePath);
      image.size = info.size;
    }

    if (image.size && image.size > driverConfig.maxSize) service.error('Image exceeds the allowed size');

    try {
      if (data) {
        let { width, height } = imageSize(data);
        image.width = width;
        image.height = height;
      } else if (filePath) {
        let { width, height } = await imageSizeAsync(filePath);
        image.width = width;
        image.height = height;
      }
    } catch (e) {
      console.error(e);
    }

    let replacement = {
      ID: image.id,
      EXT: image.ext || '',
      NAME: image.name || `${image.id}.${image.ext}`
    };

    let pathFormat = driverConfig.pathFormat;

    image.path = moment().format(pathFormat.replace(/\{(EXT|ID|NAME)\[?(\d*),?(\d*)\]?\}/g, (all, holder, start, length) => {
      if (length && !start) {
        start = 0;
      }
      start = parseInt(start);
      // @ts-ignore index
      let word = replacement[holder];
      if (Number.isNaN(start)) {
        return `[${word}]`;
      }
      length = parseInt(length);
      if (Number.isNaN(length)) {
        return `[${word[start]}]`;
      }
      return `[${word.substr(start, length)}]`;
    }));

    let fsd = driverConfig.fsd(image.path);
    if (fsd.needEnsureDir) {
      let dir = driverConfig.fsd(fsd.dir);
      if (!await dir.exists()) {
        await dir.mkdir(true);
      }
    }
    await fsd.write(data || file);

    image.url = await fsd.createUrl();
    image.thumbUrl = image.url;

    if (driverConfig.thumbSuffix) {
      image.thumbUrl += driverConfig.thumbSuffix.replace('{EXT}', image.ext);
    }

    await image.save();

    return image;
  }
}
