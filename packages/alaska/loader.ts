import { ExtensionConfig } from '.';
import { ModulesMetadata } from 'alaska-modules';

export default class Loader {
  static readonly classOfLoader = true;
  readonly instanceOfLoader: true;
  metadata: ModulesMetadata;
  extConfig: ExtensionConfig;

  constructor(metadata: ModulesMetadata, extConfig: ExtensionConfig) {
    this.instanceOfLoader = true;
    this.metadata = metadata;
    this.extConfig = extConfig;
  }
}
