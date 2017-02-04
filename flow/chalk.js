// improved https://github.com/freebroccolo/flow-chalk

declare interface Chalk$Path {
  bgBlack: Chalk$Node;
  bgBlue: Chalk$Node;
  bgCyan: Chalk$Node;
  bgGreen: Chalk$Node;
  bgMagenta: Chalk$Node;
  bgRed: Chalk$Node;
  bgWhite: Chalk$Node;
  bgYellow: Chalk$Node;
  black: Chalk$Node;
  blue: Chalk$Node;
  bold: Chalk$Node;
  cyan: Chalk$Node;
  dim: Chalk$Node;
  gray: Chalk$Node;
  green: Chalk$Node;
  grey: Chalk$Node;
  hidden: Chalk$Node;
  inverse: Chalk$Node;
  italic: Chalk$Node;
  magenta: Chalk$Node;
  red: Chalk$Node;
  reset: Chalk$Node;
  strikethrough: Chalk$Node;
  underline: Chalk$Node;
  white: Chalk$Node;
  yellow: Chalk$Node;
}

declare interface Chalk$Node extends Chalk$Path {
  (...text: string[]): string;
}

declare interface Chalk$StylePoly<Open: string, Close: string> {
  open: Open;
  close: Close;
  closeRe: RegExp;
}

declare type Chalk$StyleBgBlackOpen = "\u001b[40m"
declare type Chalk$StyleBgBlueOpen = "\u001b[44m"
declare type Chalk$StyleBgCyanOpen = "\u001b[46m"
declare type Chalk$StyleBgGreenOpen = "\u001b[42m"
declare type Chalk$StyleBgMagentaOpen = "\u001b[45m"
declare type Chalk$StyleBgRedOpen = "\u001b[41m"
declare type Chalk$StyleBgWhiteOpen = "\u001b[47m"
declare type Chalk$StyleBgYellowOpen = "\u001b[43m"
declare type Chalk$StyleBlackOpen = "\u001b[30m"
declare type Chalk$StyleBlueOpen = "\u001b[34m"
declare type Chalk$StyleBoldOpen = "\u001b[1m"
declare type Chalk$StyleCyanOpen = "\u001b[36m"
declare type Chalk$StyleDimOpen = "\u001b[2m"
declare type Chalk$StyleGrayOpen = "\u001b[80m"
declare type Chalk$StyleGreenOpen = "\u001b[32m"
declare type Chalk$StyleGreyOpen = "\u001b[90m"
declare type Chalk$StyleHiddenOpen = "\u001b[8m"
declare type Chalk$StyleInverseOpen = "\u001b[7m"
declare type Chalk$StyleItalicOpen = "\u001b[3m"
declare type Chalk$StyleMagentaOpen = "\u001b[35m"
declare type Chalk$StyleRedOpen = "\u001b[31m"
declare type Chalk$StyleResetOpen = "\u001b[0m"
declare type Chalk$StyleStrikeThroughOpen = "\u001b[9m"
declare type Chalk$StyleUnderlineOpen = "\u001b[4m"
declare type Chalk$StyleWhiteOpen = "\u001b[37m"
declare type Chalk$StyleYellowOpen = "\u001b[33m"

declare type Chalk$StyleBgBlackClose = "\u001b[49m"
declare type Chalk$StyleBgBlueClose = "\u001b[49m"
declare type Chalk$StyleBgCyanClose = "\u001b[49m"
declare type Chalk$StyleBgGreenClose = "\u001b[49m"
declare type Chalk$StyleBgMagentaClose = "\u001b[49m"
declare type Chalk$StyleBgRedClose = "\u001b[49m"
declare type Chalk$StyleBgWhiteClose = "\u001b[49m"
declare type Chalk$StyleBgYellowClose = "\u001b[49m"
declare type Chalk$StyleBlackClose = "\u001b[39m"
declare type Chalk$StyleBlueClose = "\u001b[39m"
declare type Chalk$StyleBoldClose = "\u001b[22m"
declare type Chalk$StyleCyanClose = "\u001b[39m"
declare type Chalk$StyleDimClose = "\u001b[22m"
declare type Chalk$StyleGrayClose = "\u001b[39m"
declare type Chalk$StyleGreenClose = "\u001b[39m"
declare type Chalk$StyleGreyClose = "\u001b[39m"
declare type Chalk$StyleHiddenClose = "\u001b[28m"
declare type Chalk$StyleInverseClose = "\u001b[27m"
declare type Chalk$StyleItalicClose = "\u001b[23m"
declare type Chalk$StyleMagentaClose = "\u001b[39m"
declare type Chalk$StyleRedClose = "\u001b[39m"
declare type Chalk$StyleResetClose = "\u001b[0m"
declare type Chalk$StyleStrikeThroughClose = "\u001b[29m"
declare type Chalk$StyleUnderlineClose = "\u001b[24m"
declare type Chalk$StyleWhiteClose = "\u001b[39m"
declare type Chalk$StyleYellowClose = "\u001b[39m"

declare interface Chalk$Table {
  bgBlack: Chalk$StylePoly<Chalk$StyleBgBlackOpen, Chalk$StyleBgBlackClose>;
  bgBlue: Chalk$StylePoly<Chalk$StyleBgBlueOpen, Chalk$StyleBgBlueClose>;
  bgCyan: Chalk$StylePoly<Chalk$StyleBgCyanOpen, Chalk$StyleBgCyanClose>;
  bgGreen: Chalk$StylePoly<Chalk$StyleBgGreenOpen, Chalk$StyleBgGreenClose>;
  bgMagenta: Chalk$StylePoly<Chalk$StyleBgMagentaOpen, Chalk$StyleBgMagentaClose>;
  bgRed: Chalk$StylePoly<Chalk$StyleBgRedOpen, Chalk$StyleBgRedClose>;
  bgWhite: Chalk$StylePoly<Chalk$StyleBgWhiteOpen, Chalk$StyleBgWhiteClose>;
  bgYellow: Chalk$StylePoly<Chalk$StyleBgYellowOpen, Chalk$StyleBgYellowClose>;
  black: Chalk$StylePoly<Chalk$StyleBlackOpen, Chalk$StyleBlackClose>;
  blue: Chalk$StylePoly<Chalk$StyleBlueOpen, Chalk$StyleBlueClose>;
  bold: Chalk$StylePoly<Chalk$StyleBoldOpen, Chalk$StyleBoldClose>;
  cyan: Chalk$StylePoly<Chalk$StyleCyanOpen, Chalk$StyleCyanClose>;
  dim: Chalk$StylePoly<Chalk$StyleDimOpen, Chalk$StyleDimClose>;
  gray: Chalk$StylePoly<Chalk$StyleGrayOpen, Chalk$StyleGrayClose>;
  green: Chalk$StylePoly<Chalk$StyleGreenOpen, Chalk$StyleGreenClose>;
  grey: Chalk$StylePoly<Chalk$StyleGreyOpen, Chalk$StyleGreyClose>;
  hidden: Chalk$StylePoly<Chalk$StyleHiddenOpen, Chalk$StyleHiddenClose>;
  inverse: Chalk$StylePoly<Chalk$StyleInverseOpen, Chalk$StyleInverseClose>;
  italic: Chalk$StylePoly<Chalk$StyleItalicOpen, Chalk$StyleItalicClose>;
  magenta: Chalk$StylePoly<Chalk$StyleMagentaOpen, Chalk$StyleMagentaClose>;
  red: Chalk$StylePoly<Chalk$StyleRedOpen, Chalk$StyleRedClose>;
  reset: Chalk$StylePoly<Chalk$StyleResetOpen, Chalk$StyleResetClose>;
  strikethrough: Chalk$StylePoly<Chalk$StyleStrikeThroughOpen, Chalk$StyleStrikeThroughClose>;
  underline: Chalk$StylePoly<Chalk$StyleUnderlineOpen, Chalk$StyleUnderlineClose>;
  white: Chalk$StylePoly<Chalk$StyleWhiteOpen, Chalk$StyleWhiteClose>;
  yellow: Chalk$StylePoly<Chalk$StyleYellowOpen, Chalk$StyleYellowClose>;
}

declare module "chalk" {
  declare var exports: Chalk$Path & {
    enabled: boolean;
    styles: Chalk$Table;
    supportsColor: boolean;
  }
}
