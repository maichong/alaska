export default {
  services: {
    'alaska-user': {},
    'alaska-income': {}
  },
  //佣金比例设置,例如 [ 0.2, 0.05 ] 则给一级提佣20%,给二级提佣5%
  commissionRates: [],
  //promoter Cookie选项
  cookieOptions: {
    maxAge: 7 * 86400 * 1000
  }
};
