import Ability from 'alaska-user/models/Ability';

export default async function () {
  let ability = await Ability.findById('test.Order.update.content');
  if (!ability) {
    new Ability({
      _id: 'test.Order.update.content',
      title: 'Update Order Content',
      service: 'test',
    }).save();
  }
}
