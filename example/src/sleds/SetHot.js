import { Sled } from 'alaska';

export default class SetHot extends Sled {
  async exec(params) {
    let { article, records } = params;
    if (article) {
      article.hot = true;
      await article.save();
    }

    if (records) {
      await Promise.all(records.map(async(record) => {
        record.hot = true;
        await record.save();
      }));
    }
  }
}
