declare module esprima {

  declare function parse(input: string, config?: Object, delegate?: Function): Object;

  declare function tokenize(input: string, config?: Object): Array<{
    type:string;
    value:string;
    range?:[number,number];
    loc?: any
  }>;

  declare var exports: {
    parse:parse;
    tokenize:tokenize;
  }
}
