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
