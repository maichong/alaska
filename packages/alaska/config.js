/**
 * 默认配置
 * @module config
 */
export default {
  //
  // APP settings
  //

  /**
   * [APP] APP名称
   * @type {string}
   */
  name: 'anyway',

  /**
   * [APP] APP中间件列表
   * @type {Object}
   * @example
   * {
   *    'alaska-middleware-session': {
   *       id:'alaska-middleware-session',
   *       fn: null,
   *       sort: 0,
   *       options:{}
   *    }
   * }
   */
  middlewares: {},

  /**
   * [APP] 监听端口
   * @type {number}
   */
  port: 5000,

  /**
   * [APP] 运行环境
   * @type {string}
   */
  env: process.env.NODE_ENV || 'production',

  /**
   * [APP] session
   * @type {Object}
   */
  session: {
    cookie: {},
    store: {
      id: 'session-store', // cache name
      type: 'alaska-cache-lru',
      maxAge: 1000 * 60 * 60
    }
  },

  /**
   * 当前App支持的语言列表
   * @type {[]}
   */
  locales: ['en', 'zh-CN'],

  /**
   * 当前App默认语言
   * @type {string}
   */
  defaultLocale: 'en',

  /**
   * 修改Locale的GET请求查询键
   * @type string
   */
  localeQueryKey: 'locale',

  /**
   * 保存Locale cookie
   * @type string
   */
  localeCookieKey: 'alaska.locale',

  //
  // KOA settings
  //

  /**
   * [KOA] 代理模式
   * @type {boolean}
   */
  proxy: false,

  /**
   * [KOA] 子域名
   * @type {number}
   */
  subdomainOffset: 2,
  //
  // Service settings
  //

  /**
   * [Service] 域名,如果不指定,子Service将使用主Service的域名
   * 例如 docs.google.com
   * 如果设置为泛域名,则koa.Context 对象将有subdomian变量
   * @type {string}
   */
  domain: undefined,
  /**
   * [Service] 跳转地址,如果主域名不匹配将跳转至此地址
   * @type {string}
   */
  redirect: '',
  /**
   * [Service] Service的URL访问地址PATH中前缀,若为false则该Service不挂载任何中间件或控制器
   * @type {string|boolean}
   */
  prefix: '',
  /**
   * [Service] Service的控制器访问地址PATH中后缀
   * @type {string}
   */
  suffix: '.html',
  /** [Service] 默认控制器名称
   * @type {string}
   */
  defaultController: 'index',
  /**
   * [Service] 控制器中默认Action名称
   * @type {string}
   */
  defaultAction: 'default',
  /**
   * [Service] 控制器路由接受的HTTP方法列表
   * @type {Array}
   */
  methods: ['GET', 'POST', 'HEAD'],
  /**
   * [Service] 静态目录列表
   * @type {Array}
   */
  statics: [],
  /**
   * [Service] 模板引擎
   * @type {Object}
   */
  renderer: {
    type: 'alaska-renderer-swig'
  },
  /**
   * [Service] 该Service依赖的子Service列表
   * @type {Object}
   */
  services: {},
  /**
   * [Service] 插件列表
   */
  plugins: {},
  /**
   * [Service] 数据库链接设置
   * 如果为false则表明该Service不使用数据库链接
   * 如果不配置,则使用主Service的链接
   * @type {boolean|string}
   */
  db: '',
  /**
   * [Service] 数据库collection前缀
   * @type {boolean|string}
   */
  dbPrefix: false,
  /**
   * [Service] Service默认缓存设置或已经实例化的缓存驱动对象
   * @type {Object|string}
   */
  cache: {
    id: 'default-of-service',
    type: 'alaska-cache-lru',
    prefix: false,
    maxAge: 3600 * 1000
  }
};
