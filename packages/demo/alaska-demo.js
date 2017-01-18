
process.title = 'alaska-demo';

process.chdir(__dirname);

import alaska from 'alaska';

let options = {
  id: 'alaska-demo',
  dir: __dirname
};

alaska.launch(options).then(() => {
  console.log('alaska-demo started');
}, (error) => {
  process.exit(1);
});
