"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Path = require("path");
const chalk_1 = require("chalk");
const mkdirp = require("mkdirp");
const read = require("read-promise");
function isFile(path) {
    try {
        return fs.statSync(path).isFile();
    }
    catch (error) {
        return false;
    }
}
exports.isFile = isFile;
function isDir(path) {
    try {
        return fs.statSync(path).isDirectory();
    }
    catch (error) {
        return false;
    }
}
exports.isDir = isDir;
function readJSON(file) {
    let data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
}
exports.readJSON = readJSON;
function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
exports.writeJson = writeJson;
async function readValue(options, checker) {
    let value = await read(options);
    if (checker(value)) {
        return value;
    }
    return await readValue(options, checker);
}
exports.readValue = readValue;
function transformSrouceFile(from, to, babel) {
    mkdirp.sync(Path.dirname(to));
    let relative = Path.relative(process.cwd(), from);
    let needBabel = false;
    if (babel && /\.jsx?$/.test(to)) {
        needBabel = true;
    }
    if (needBabel) {
        console.log(chalk_1.default.blue('    transform'), relative);
        let code = babel.transformFileSync(from, {}).code;
        fs.writeFileSync(to, code);
    }
    else {
        console.log(chalk_1.default.blue('    copy'), relative);
        fs.copyFileSync(from, to);
    }
}
function transformSrouceDir(from, to, babel) {
    mkdirp.sync(Path.dirname(to));
    let files = fs.readdirSync(from);
    for (let file of files) {
        if (file === '.DS_Store')
            continue;
        let fromPath = Path.join(from, file);
        let toPath = Path.join(to, file);
        if (isDir(fromPath)) {
            transformSrouceDir(fromPath, toPath, babel);
        }
        else {
            if (/\.tsx?$/.test(file))
                continue;
            transformSrouceFile(fromPath, toPath, babel);
        }
    }
}
exports.transformSrouceDir = transformSrouceDir;
