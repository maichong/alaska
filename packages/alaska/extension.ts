import { MainService } from '.';

export default class Extension {
  static readonly after: string[] = [];
  static readonly classOfExtension = true;
  readonly instanceOfExtension: true;
  readonly main: MainService;

  constructor(main: MainService) {
    this.main = main;
    this.instanceOfExtension = true;
  }
}
