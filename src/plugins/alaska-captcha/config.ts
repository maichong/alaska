export default {
  cache: {
    type: 'alaska-cache-mongo',
    uri: 'mongodb://10.10.10.10:27017/alaska-14',
    collection: 'app_captcha',
    maxAge: 3600 * 1000
  }
};
