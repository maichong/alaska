export default {
  prefix: '',
  services: {
    'alaska-settings': {
      // optional: true
    }
  },
  cache: {
    // 用于缓存用户 abilities 数据
    type: 'alaska-cache-lru',
    maxAge: 5 * 60 * 1000
  }
};
