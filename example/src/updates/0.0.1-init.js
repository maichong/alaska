import Register from 'alaska-user/sleds/Register';
import Init from 'alaska-admin/sleds/Init';

export default async function () {
  await Init.run();

  await Register.run({
    username: 'alaska',
    password: '123456',
    roles: ['root']
  });
}
