export default {
  prefix: '',
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
