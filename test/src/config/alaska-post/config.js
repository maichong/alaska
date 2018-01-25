export default {
  cache: {
    type: 'alaska-cache-mongo',
    url: 'mongodb://localhost/alaska-demo',
    collection: 'post_cache',
    maxAge: 3600
  }
};
