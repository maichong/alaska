export default class ArticleCat extends service.Model {
  static label = 'Article Category';
  static title = 'name';
  static defaultColumns = '_id name parent';
  static fields = {
    name: {
      label: 'Name',
      type: String,
      required: true
    },
    parent: {
      label: 'Parent Category',
      type: ArticleCat
    }
  };
}
