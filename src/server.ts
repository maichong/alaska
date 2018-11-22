process.env.NODE_ENV = 'development';

import main from './index';
import lookupModules from '../packages/alaska-modules';

let modules = lookupModules(main, __dirname);
main.launch(modules).then(() => {
  console.log('Server started');
}, (error) => {
  console.error('Launch failed!', error);
  process.exit(1);
});
