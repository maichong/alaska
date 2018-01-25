import Register from '../../modules/alaska-user/sleds/Register';
import Init from '../../modules/alaska-admin/sleds/Init';

export default async function () {
  await Init.run();

  await Register.run({
    username: 'alaska',
    password: '123456',
    roles: ['root']
  });
}
