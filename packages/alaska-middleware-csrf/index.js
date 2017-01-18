// @flow

export default function ():Function {
  return function (ctx:Alaska$Context, next:Function) {
    console.log(next);
  };
}
