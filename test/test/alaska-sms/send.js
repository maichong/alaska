import test from 'tape';
import Send from '../../modules/alaska-sms/sleds/Send';

test('alaska sms send', (troot) => {
  test('send by custom driver', async(t) => {
    let res = await Send.run({ to: '18000000000', message: 'hello', driver: 'custom' });
    t.deepEqual(res, { to: '18000000000', message: 'hello' }, 'custom sms driver result');
    t.end();
  });
  troot.end();
});
