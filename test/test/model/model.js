import test from 'tape';
import ArticleCat from '../../src/models/ArticleCat';
import Article from '../../src/models/Article';

test('model', (troot) => {
  test('model modelName/id/key', (t) => {
    t.ok(ArticleCat.registered);
    t.equal(ArticleCat.modelName, 'ArticleCat');
    t.equal(ArticleCat.id, 'article-cat');
    t.equal(ArticleCat.key, 'test.article-cat');
    t.end();
  });

  test('before test model', async(t) => {
    await (new ArticleCat({ name: 'for test' })).save();
    t.equal(await ArticleCat.count({ name: 'for test' }), 1, 'article-cat count');
    t.end();
  });

  test('test model', async(t) => {
    let cat = await ArticleCat.findOne({ name: 'for test' });
    t.ok(cat);
    let article = new Article({ cat, title: 'for test' });
    await article.save();
    t.equal(await Article.count({ title: 'for test' }), 1, 'article count');
    await Article.remove({ title: 'for test' });
    t.end();
  });

  test('after test model', async(t) => {
    t.equal(await ArticleCat.count({ name: 'for test' }), 1, 'article-cat count');
    await ArticleCat.remove({ name: 'for test' });
    t.equal(await ArticleCat.count({ name: 'for test' }), 0, 'article-cat count');
    t.end();
  });
  troot.end();
});
