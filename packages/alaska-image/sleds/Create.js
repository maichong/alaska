"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const Path = require("path");
const fs = require("fs");
const util = require("util");
const moment = require("moment");
const imageSize = require("image-size");
const isStream = require("is-stream");
const delay_1 = require("delay");
const is_svg_1 = require("is-svg");
const file_type_1 = require("file-type");
const Image_1 = require("../models/Image");
const __1 = require("..");
const stat = util.promisify(fs.stat);
const imageSizeAsync = util.promisify(imageSize);
class Create extends alaska_sled_1.Sled {
    async exec(params) {
        let { driver, body, ctx, file, data, name } = params;
        body = body || {};
        driver = driver || body.driver || 'default';
        if (!__1.default.drivers.hasOwnProperty(driver)) {
            __1.default.error('Image storage driver not found!');
        }
        let driverConfig = __1.default.drivers[driver];
        if (!file && !data) {
            if (!ctx)
                __1.default.error('image file is required');
            if (ctx.files && ctx.files.file) {
                file = ctx.files.file;
            }
            else if (ctx.request.body && ctx.request.body.data && typeof ctx.request.body.data === 'string') {
                data = Buffer.from(ctx.request.body.data, 'base64');
                name = name || ctx.request.body.name;
            }
            else {
                __1.default.error('upload file is required');
            }
        }
        let image = new Image_1.default({ name });
        let user = params.user;
        if (!user && params.admin) {
            user = params.admin._id;
        }
        if (user) {
            image.user = user;
        }
        let filePath;
        if (!data) {
            if (typeof file === 'string') {
                filePath = file;
                file = fs.createReadStream(file);
            }
            else if (isStream.readable(file)) {
                filePath = file.path;
                if (!image.name) {
                    image.name = file.filename;
                }
            }
        }
        if (!image.name && filePath) {
            image.name = Path.basename(filePath);
        }
        if (image.name) {
            image.ext = Path.extname(image.name).toLowerCase().replace('.', '').replace('jpeg', 'jpg');
        }
        if (data && !image.ext) {
            let info = file_type_1.default(data);
            if (info.ext) {
                image.ext = info.ext;
            }
            else if (is_svg_1.default(data)) {
                image.ext = 'svg';
            }
        }
        if (!driverConfig.allowed.includes(image.ext))
            __1.default.error('Invalid image format');
        if (image.ext && !image.name) {
            image.name = `${image.id}.${image.ext}`;
        }
        if (data) {
            image.size = data.length;
        }
        if (!image.size && filePath) {
            let info = await stat(filePath);
            image.size = info.size;
        }
        if (image.size && image.size > driverConfig.maxSize)
            __1.default.error('Image exceeds the allowed size');
        try {
            if (data) {
                let { width, height } = imageSize(data);
                image.width = width;
                image.height = height;
            }
            else if (filePath) {
                let { width, height } = await imageSizeAsync(filePath);
                image.width = width;
                image.height = height;
            }
        }
        catch (e) {
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
        await image.save({ session: this.dbSession });
        if (driverConfig.adapter === 'fsd-oss') {
            await delay_1.default(1000);
        }
        return image;
    }
}
exports.default = Create;
