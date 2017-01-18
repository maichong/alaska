export default {
  id: 'alaska-demo',
  db: 'mongodb://localhost/alaska-demo',
  appMiddlewares: [
    {
      id: 'koa-logger',
      sort: 1000
    }
  ],
  session: {
    cookie: {},
    store: {
      type: 'alaska-cache-mongo',
      url: 'mongodb://localhost/alaska-demo',
      collection: 'app_session',
      maxAge: 3600
    }
  },
  services: [
    'alaska-update',
    {
      id: 'alaska-admin',
      alias: 'admin'
    },
    {
      id: 'alaska-user',
      alias: 'user'
    },
    {
      id: 'alaska-post',
      alias: 'post'
    }
  ],
  domain: '',
  prefix: '',
  redirect: '',
  statics: [
    {
      root: 'public',
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
  port: 5000
}
