// @flow

import fs from 'fs';
import { Sled, utils } from 'alaska';
import AppUpdate from '../models/AppUpdate';

export default class Update extends Sled {

  async exec(params: Object) {
    const dir = params.dir;
    if (!dir) {
      throw new ReferenceError('alaska-update sled Update data.dir is required');
    }

    let files;
    try {
      files = fs.readdirSync(dir);
    } catch (error) {
      return;
    }
    if (files.length) {
      for (let file of files) {
        let has = await AppUpdate.count({ key: file });
        if (!has) {
          console.log('Apply update script ', file);
          let mod = utils.include(dir + file, true);

          if (!(typeof mod === 'function')) {
            console.log(`Update script "${file}" must export a async function as default!`);
            process.exit();
          }

          await mod();
          await (new AppUpdate({ key: file })).save();
        }
      }
    }
  }
}
