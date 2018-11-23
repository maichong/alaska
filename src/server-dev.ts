import lookupModules from 'alaska-modules';
import main from './index';

let modules = lookupModules(main, __dirname);

main.launch(modules).then(() => {
  console.log('Server started');
}, (error) => {
  console.error('Launch failed!', error);
  process.exit(1);
});
