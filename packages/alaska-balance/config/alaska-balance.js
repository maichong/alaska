/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-07
 * @author Liang <liang@maichong.it>
 */

export default {
  prefix: '/balance',
  controllers: false,
  services: {
    'alaska-user': {}
  },
  currencies: [{
    value: 'balance',
    label: 'Balance',
    unit: '',
    //精确到小数点后两位
    precision: 2,
    default: true
  }, {
    value: 'credit',
    label: 'Credit',
    unit: ''
  }]
};
