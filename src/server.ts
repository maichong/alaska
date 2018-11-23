import main from './index';
import modules from './modules';

main.launch(modules).then(() => {
  console.log('Server started');
}, (error) => {
  console.error('Launch failed!', error);
  process.exit(1);
});