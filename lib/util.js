'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFile = isFile;
exports.isDirectory = isDirectory;
exports.include = include;
exports.isHidden = isHidden;
exports.noop = noop;
exports.bindMethods = bindMethods;
exports.escapeRegExp = escapeRegExp;
exports.isMongoId = isMongoId;
exports.nameToKey = nameToKey;
exports.pareseAcceptLanguage = pareseAcceptLanguage;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 判断指定路径是否是文件
 * @param {string} path
 * @returns {boolean}
 */
/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-19
 * @author Liang <liang@maichong.it>
 */

function isFile(path) {
  try {
    return _fs2.default.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

/**
 * 判断指定路径是否是文件夹
 * @param {string} path
 * @returns {boolean}
 */
function isDirectory(path) {
  try {
    return _fs2.default.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

/**
 * 智能导入
 * @param {string} path 文件或文件夹路径
 * @param {boolean} [importDefault]
 * @param {Object} [vars] 加载时,要向脚本注入的变量列表
 * @returns {Object}
 */
function include(path) {
  let importDefault = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
  let vars = arguments[2];

  let result = null;
  let oldRequire;
  if (vars) {
    oldRequire = require.extensions['.js'];
    require.extensions['.js'] = function (m, filename) {
      let compile = m._compile;
      m._compile = function (content, file) {
        if (!/(config|api|controllers|models|sleds|updates|middlewares)\/[a-z0-9\-\_]+\.js$/i.test(file)) {
          compile.call(m, content, file);
          return;
        }
        Object.assign(global, vars);
        let injection = "'use strict';";
        for (let key in vars) {
          if (vars.hasOwnProperty(key)) {
            injection += `const ${ key }=global.${ key }; `;
          }
        }
        if (content.indexOf("'use strict';") === 0) {
          content = content.replace("'use strict';", injection);
        } else {
          content = injection + content;
        }
        try {
          compile.call(m, content, file);
        } catch (error) {
          console.error('load file failed: ' + file);
          throw error;
        }
      };
      oldRequire(m, filename);
    };
  }
  if (isFile(path)) {
    result = require(path);
    if (importDefault && result.default) {
      result = result.default;
    }
  }
  if (isDirectory(path)) {
    result = {};
    _fs2.default.readdirSync(path).forEach(file => {
      if (file.endsWith('.js')) {
        let name = file.slice(0, -3);
        let obj = require(path + '/' + file);
        result[name] = importDefault && obj.default ? obj.default : obj;
      }
    });
  }
  if (oldRequire) {
    require.extensions['.js'] = oldRequire;
  }
  return result;
}

/**
 * 判断某路径是否是隐藏的
 * @param {string} path
 * @returns {boolean}
 */
function isHidden(path) {
  return (/[\\\/]\.\w/.test(path)
  );
}

const resolved = Promise.resolve();

/**
 * noop
 * @returns {Promise}
 */
function noop() {
  return resolved;
}

/**
 * 递归将obj上所有的方法绑定至scope
 * @param {Object} obj
 * @param {Object} scope
 * @returns {Object}
 */
function bindMethods(obj, scope) {
  let bound = {};
  for (let key in obj) {
    if (typeof obj[key] === 'function') {
      bound[key] = obj[key].bind(scope);
    } else if (_lodash2.default.isObject(obj[key])) {
      bound[key] = bindMethods(obj[key], scope);
    }
  }
  return bound;
}

/**
 * 生成安全的正则字符串
 * @param {string} str
 * @returns {string}
 */
function escapeRegExp(str) {
  if (str && str.toString) str = str.toString();
  if (typeof str !== 'string' || !str.length) return '';
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/**
 * 判断字符串是否是合法的MongoID格式
 * @param {string} input
 * @returns {boolean}
 */
function isMongoId(input) {
  return (/^[a-f0-9]{24}$/.test(input)
  );
}

/**
 * 将驼峰样式字符串转为小写字符串样式
 * @param {string} name
 * @returns {string}
 */
function nameToKey(name) {
  return name.replace(/([a-z])([A-Z])/g, (a, b, c) => b + '-' + c.toLowerCase()).toLowerCase();
}

/**
 * 解析Accept Language
 * @param {string} header
 * @returns {Array}
 */
function pareseAcceptLanguage(header) {
  if (!header) {
    return [];
  }
  return header.split(',').map(item => {
    let lang = item.split(';q=');
    if (lang.length < 2) {
      lang[1] = 1;
    } else {
      lang[1] = parseFloat(lang[1]) || 0;
    }
    return lang;
  }).filter(lang => lang[1] > 0).sort((a, b) => a[1] < b[1]).map(lang => lang[0]);
}