import { ConfigData } from 'alaska';
import { } from 'alaska-model';
import { } from 'alaska-api';
import { StaticsConfig } from 'alaska-statics';

const isProduction = process.env.NODE_ENV !== 'development';

export default <ConfigData>{
  libraries: [
    'fsd-fs'
  ],
  env: isProduction ? 'production' : 'development',
  extensions: {
    'alaska-model': {},
    'alaska-sled': {},
    'alaska-routes': {},
    'alaska-locale': {},
    'alaska-http': {},
    'alaska-api': {},
    'alaska-statics': {},
    'alaska-react': {}
  },
  middlewares: {
    'koa-bodyparser': {},
    'alaska-middleware-upload': {},
    'alaska-middleware-session': {
      store: {
        type: 'alaska-cache-mongo',
        uri: 'mongodb://10.10.10.10:27017/alaska-14',
        collection: 'app_session'
      },
      cookie: {
        key: 'sid',
        maxAge: 86400 * 365 * 1000
      }
    },
    'alaska-middleware-user': {},
    'alaska-middleware-captcha': {
      paths: {
        '/*/register': {
          to: 'username'
        }
      }
    }
  },
  plugins: {
  },
  services: {
    'alaska-user': {},
    'alaska-admin': {},
    'alaska-payment': {},
    'alaska-address': {},
    'alaska-balance': {},
    'alaska-banner': {},
    'alaska-help': {},
    'alaska-page': {},
    'alaska-sms': {},
    'alaska-update': {},
    'alaska-captcha': {}
  },
  autoUpdate: true, //是否启动 alaska-update
  locales: ['zh-CN', 'en'],
  'alaska-model': {
    mongodb: {
      uri: 'mongodb://10.10.10.10:27017/alaska-14',
      options: {
      }
    }
  },
  'alaska-http': {
    listen: {
      port: 5000
    }
  },
  'alaska-statics': <StaticsConfig>{
    main: {
      prefix: '',
      dir: 'public',
      dynamic: !isProduction, // 非生产环境、DEV环境，动态载入文件
      preload: isProduction, // 生产环境预加载文件
      buffer: isProduction, // 生产环境将文件储存在内存中
      maxAge: isProduction ? 60000 : 0, // 生产环境允许文件生存周期
    },
    admin: {
      prefix: '/admin',
      dir: 'node_modules/alaska-admin/statics',
      buffer: true,
      maxAge: 60000
    }
  },
  autoLogin: {
    key: 'alaska.uid',
    secret: 'secret'
  }
};
