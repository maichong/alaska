export default {
  cache: {
    type: 'alaska-cache-lru',
    max: 2000
  },
  // drivers: {
  //   default: {
  //     adapter: 'fsd-fs',
  //     adapterOptions: {
  //       // https://github.com/maichong/fsd/tree/master/packages/fsd-fs
  //       root: '/app/uploads',
  //       tmpdir: '/app/temp',
  //       mode: 0o666,
  //       urlPrefix: 'http://your.domain'
  //     }
  //   }
  // }
};
