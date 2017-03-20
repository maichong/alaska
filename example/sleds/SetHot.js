/**
 * @copyright Maichong Software Ltd. 2017 http://maichong.it
 * @date 2017-03-20
 * @author Liang <liang@maichong.it>
 */

import { Sled } from 'alaska';

export default class SetHot extends Sled {

  async exec(params) {
    let article = params.article;
    if (article) {
      article.hot = true;
      await article.save();
    }

    if (params.records) {
      await Promise.all(
        params.records.map(async(record) => {
          record.hot = true;
          await record.save();
        })
      );
    }
  }

}
