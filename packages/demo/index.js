
process.env.BABEL_CACHE_PATH = process.env.BABEL_CACHE_PATH || 'runtime/babel-cache.json';

require('babel-register')({
  ignore: /node_modules/
});

require('./alaska-demo');
