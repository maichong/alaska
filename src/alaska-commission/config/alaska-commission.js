
export default {
  prefix: '/commission',
  services: {
    'alaska-user': {},
    'alaska-balance': {}
  },
  //佣金比例设置,例如 [ 0.2, 0.05 ] 则给一级提佣20%,给二级提佣5%
  commissionRates: [],
  //promoter参数Key
  queryKey: 'p',
  //promoter Cookie选项
  cookieOptions: {
    maxAge: 7 * 86400 * 1000
  }
};
