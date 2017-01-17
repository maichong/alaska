// @flow

module.exports = function (options):Function {
  console.log(options);
  return function (ctx:Alaska$Context, next:Function) {
    console.log(next);
  };
};
