/* eslint global-require:0 */

export default {
  drivers: {
    custom: {
      type: require('./driver').default
    }
  }
};
