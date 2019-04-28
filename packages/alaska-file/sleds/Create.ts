import { Sled } from 'alaska-sled';
import * as Path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as moment from 'moment';
import * as isStream from 'is-stream';
import fileType from 'file-type';
import File from '../models/File';
import service, { CreateParams } from '..';
import { RecordId } from 'alaska-model';

const stat = util.promisify(fs.stat);

export default class Create extends Sled<CreateParams, File> {
  async exec(params: CreateParams): Promise<File> {
    let { driver, body, ctx, file, data, name } = params;
    body = body || {};
    driver = driver || body.driver || 'default';
    if (!service.drivers.hasOwnProperty(driver)) {
      service.error('File storage driver not found!');
    }
    let driverConfig = service.drivers[driver];
    if (!file && !data) {
      if (!ctx) service.error('file is required');
      if (ctx.files && ctx.files.file) {
        if (Array.isArray(ctx.files.file)) {
          // ctx.files.file 只允许单个文件，不能是数组
          service.error('Only a single file was allowed!');
        } else {
          file = ctx.files.file;
        }
      } else if (ctx.request.body && ctx.request.body.data && typeof ctx.request.body.data === 'string') {
        data = Buffer.from(ctx.request.body.data, 'base64');
        name = name || ctx.request.body.name;
      } else {
        service.error('upload file is required');
      }
    }

    let record = new File({ name });

    let user = params.user;
    if (!user && params.admin) {
      user = params.admin._id as RecordId;
    }
    if (user) {
      record.user = user;
    }

    let filePath: string;
    if (!data) {
      if (typeof file === 'string') {
        filePath = file;
        file = fs.createReadStream(file);
      } else if (isStream.readable(file)) {
        // @ts-ignore 如果是上传文件，那么存在 file.path
        filePath = file.path;
        if (!record.name) {
          // @ts-ignore 如果是上传文件，那么存在 file.filename
          record.name = file.filename;
        }
      }
    }
    if (!record.name && filePath) {
      record.name = Path.basename(filePath);
    }

    if (record.name) {
      record.ext = Path.extname(record.name).toLowerCase().replace('.', '');
    }
    if (data && !record.ext) {
      let info = fileType(data);
      if (info.ext) {
        record.ext = info.ext;
      }
    }

    if (driverConfig.allowed && driverConfig.allowed.length && !driverConfig.allowed.includes(record.ext)) service.error('Invalid file format');

    if (record.ext && !record.name) {
      record.name = `${record.id}.${record.ext}`;
    }

    if (data) {
      record.size = data.length;
    }
    if (!record.size && filePath) {
      let info = await stat(filePath);
      record.size = info.size;
    }

    if (record.size && record.size > driverConfig.maxSize) service.error('File exceeds the allowed size');

    let replacement = {
      ID: record.id,
      EXT: record.ext || '',
      NAME: record.name || `${record.id}.${record.ext}`
    };

    let pathFormat = driverConfig.pathFormat;

    record.path = moment().format(pathFormat.replace(/\{(EXT|ID|NAME)\[?(\d*),?(\d*)\]?\}/g, (all, holder, start, length) => {
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

    let fsd = driverConfig.fsd(record.path);
    if (fsd.needEnsureDir) {
      let dir = driverConfig.fsd(fsd.dir);
      if (!await dir.exists()) {
        await dir.mkdir(true);
      }
    }
    await fsd.write(data || file);

    record.url = await fsd.createUrl();

    await record.save({ session: this.dbSession });

    return record;
  }
}
