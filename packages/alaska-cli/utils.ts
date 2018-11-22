import * as fs from 'fs';
import * as Path from 'path';
import chalk from 'chalk';
import * as mkdirp from 'mkdirp';
import * as read from 'read-promise';

export function isFile(path: string): boolean {
  try {
    return fs.statSync(path).isFile();
  } catch (error) {
    return false;
  }
}

export function isDir(path: string): boolean {
  try {
    return fs.statSync(path).isDirectory();
  } catch (error) {
    return false;
  }
}

export function readJSON(file: string): any {
  let data = fs.readFileSync(file, 'utf8');
  return JSON.parse(data);
}

export function writeJson(file: string, data: any): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export async function readValue(options: read.Options, checker: (value: string) => boolean): Promise<string> {
  //这个地方read读出来的是字符串，有的checker和number有冲突
  let value: string = await read(options);
  if (checker(value)) {
    return value;
  }
  return await readValue(options, checker);
}

function transformSrouceFile(from: string, to: string, babel: any) {
  mkdirp.sync(Path.dirname(to));
  let relative = Path.relative(process.cwd(), from);

  let needBabel = false;
  if (babel && /\.jsx?$/.test(to)) {
    needBabel = true;
  }
  if (needBabel) {
    console.log(chalk.blue('    transform'), relative);
    let code = babel.transformFileSync(from, {}).code;
    fs.writeFileSync(to, code);
  } else {
    console.log(chalk.blue('    copy'), relative);
    fs.copyFileSync(from, to);
  }
}

export function transformSrouceDir(from: string, to: string, babel: null | any) {
  mkdirp.sync(Path.dirname(to));

  let files = fs.readdirSync(from);

  for (let file of files) {
    if (file === '.DS_Store') continue;
    let fromPath = Path.join(from, file);
    let toPath = Path.join(to, file);
    if (isDir(fromPath)) {
      transformSrouceDir(fromPath, toPath, babel);
    } else {
      if (/\.tsx?$/.test(file)) continue;
      transformSrouceFile(fromPath, toPath, babel);
    }
  }
}
