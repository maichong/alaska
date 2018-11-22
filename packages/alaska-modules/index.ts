import { Service } from 'alaska';
import debug from './debug';
import createMetadata from './metadata';
import { Modules } from 'alaska-modules';

export { createMetadata };

export default function lookupModules(main: Service, dir: string): Promise<Modules> {
  debug('lookupModules');
  let metadata = createMetadata(main.id, dir, main.configFileName, ['node_modules']);
  return metadata.toModules();
}
