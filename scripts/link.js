const fs = require('fs');
const Path = require('path');
const childProcess = require('child_process');

fs.readdirSync('packages').forEach((name) => {
  if (!name.startsWith('alaska')) return;
  if (fs.existsSync(`node_modules/${name}`)) return;
  childProcess.execSync(`ln -s ../packages/${name} ${name}`, {
    cwd: Path.join(process.cwd(), 'node_modules')
  });
});
