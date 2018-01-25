export default {
  db: process.env.DB,
  middlewares: {
    'koa-logger': {
      sort: 1000
    }
  },
  session: {
    cookie: {},
    store: {
      type: 'alaska-cache-mongo',
      url: process.env.DB,
      collection: 'app_session',
      maxAge: 3600 * 1000
    }
  },
  locales: ['zh-CN'],
  plugins: [],
  services: {
    sub: {
      dir: '../sub-service'
    },
    'alaska-update': {},
    'alaska-user': {},
    'alaska-admin': {},
    'alaska-post': {},
    'alaska-shop': {},
    'alaska-goods': {},
    'alaska-order': {},
    'alaska-address': {},
    'alaska-cart': {},
    'alaska-commission': {},
    'alaska-feedback': {},
    'alaska-favorite': {},
    'alaska-help': {},
    'alaska-page': {},
    'alaska-link': {},
    'alaska-log': {},
    'alaska-menu': {},
    'alaska-payment': {},
    'alaska-sms': {},
    'alaska-statistics': {},
  },
  domain: '',
  prefix: '',
  redirect: '',
  renderer: {
    type: 'alaska-renderer-art'
  },
  statics: [
    {
      root: '../public',
      prefix: ''
    }
  ],
  superUser: '',
  autoUpdate: true,
  'alaska-field-image': {
    dir: 'public/uploads/',
    pathFormat: 'YYYY/MM/DD/',
    prefix: '/uploads/'
  },
  'alaska-field-iid': {
    cache: {
      type: 'alaska-cache-mongo',
      url: process.env.DB,
      collection: 'app_iid'
    }
  },
  port: 5555
};
