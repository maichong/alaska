"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const Path = require("path");
const fs = require("fs");
const util = require("util");
const moment = require("moment");
const isStream = require("is-stream");
const file_type_1 = require("file-type");
const File_1 = require("../models/File");
const __1 = require("..");
const stat = util.promisify(fs.stat);
class Create extends alaska_sled_1.Sled {
    async exec(params) {
        let { driver, body, ctx, file, data, name } = params;
        body = body || {};
        driver = driver || body.driver || 'default';
        if (!__1.default.drivers.hasOwnProperty(driver)) {
            __1.default.error('File storage driver not found!');
        }
        let driverConfig = __1.default.drivers[driver];
        if (!file && !data) {
            if (!ctx)
                __1.default.error('file is required');
            if (ctx.files && ctx.files.file) {
                if (Array.isArray(ctx.files.file)) {
                    __1.default.error('Only a single file was allowed!');
                }
                else {
                    file = ctx.files.file;
                }
            }
            else if (ctx.request.body && ctx.request.body.data && typeof ctx.request.body.data === 'string') {
                data = Buffer.from(ctx.request.body.data, 'base64');
                name = name || ctx.request.body.name;
            }
            else {
                __1.default.error('upload file is required');
            }
        }
        let record = new File_1.default({ name });
        let user = params.user;
        if (!user && params.admin) {
            user = params.admin._id;
        }
        if (user) {
            record.user = user;
        }
        let filePath;
        if (!data) {
            if (typeof file === 'string') {
                filePath = file;
                file = fs.createReadStream(file);
            }
            else if (isStream.readable(file)) {
                filePath = file.path;
                if (!record.name) {
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
            let info = file_type_1.default(data);
            if (info.ext) {
                record.ext = info.ext;
            }
        }
        if (driverConfig.allowed && driverConfig.allowed.length && !driverConfig.allowed.includes(record.ext))
            __1.default.error('Invalid file format');
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
        if (record.size && record.size > driverConfig.maxSize)
            __1.default.error('File exceeds the allowed size');
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
exports.default = Create;
