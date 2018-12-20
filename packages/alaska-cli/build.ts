import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as Path from 'path';
import * as slash from 'slash';
import * as childProcess from 'child_process';
import * as utils from './utils';
import chalk from 'chalk';
import { createMetadata } from 'alaska-modules';
import { ViewsMetadata } from 'alaska-admin-view';

interface BuildOptions {
  config?: string;
  modulesDirs?: string[];
  ts?: boolean | string;
  babel?: boolean;
  skips?: string;
}

export default async function build(options: BuildOptions) {
  console.log(chalk.green('Alaska build...'));
  const cwd = process.cwd();
  let pkgFile = Path.join(cwd, 'package.json');
  if (!utils.isFile(pkgFile)) {
    throw new Error('Current folder is not an alaska project, missing package.json');
  }

  let pkg = utils.readJSON(pkgFile);

  let mdirs = options.modulesDirs || [];
  if (mdirs.indexOf('node_modules') < 0) {
    mdirs.push('node_modules');
  }

  mdirs = mdirs.map((d: string) => Path.join(cwd, d));
  function lookupPackage(name: string) {
    for (let d of mdirs) {
      let tmp = Path.join(d, name);
      try {
        if (utils.isDir(tmp)) {
          return tmp;
        }
      } catch (e) { }
    }
  }

  const tsProject = typeof options.ts === 'string' ? options.ts : 'tsconfig.json';

  if (options.ts && !require.extensions['.ts']) {
    let tsNode = lookupPackage('ts-node');
    if (tsNode) {
      require(tsNode).register({
        project: tsProject
      });
    }
  }

  let adminViewRuntime = Path.join(cwd, 'runtime/alaska-admin-view');
  if (!utils.isDir(adminViewRuntime)) {
    mkdirp.sync(adminViewRuntime);
  }

  // views.d.ts
  fs.writeFileSync(`${adminViewRuntime}/views.d.ts`, `import { Views } from 'alaska-admin-view';\ndeclare const views: Views;\nexport = views;`);

  // build modules
  console.log(chalk.green('Build modules...'));
  let alaskaModulesPath = lookupPackage('alaska-modules');
  if (!alaskaModulesPath) {
    console.log(chalk.red('alaska-modules is not installed!'));
  } else {
    const create: createMetadata = require(Path.join(alaskaModulesPath)).createMetadata;
    let configFile = options.config;
    if (!configFile) {
      if (fs.existsSync(`src/config/${pkg.name}.js`) || fs.existsSync(`src/config/${pkg.name}.ts`)) {
        configFile = pkg.name;
      } else {
        throw new Error('Can not resolve config file!');
      }
    }
    let script = await create(pkg.name, `${process.cwd()}/src`, configFile, options.modulesDirs).toScript();
    fs.writeFileSync(`${process.cwd()}/src/modules.js`, script);
    fs.writeFileSync(`${process.cwd()}/src/modules.d.ts`, `import { Modules } from 'alaska-modules';\ndeclare const modules: Modules;\nexport default modules;`);
  }

  if (options.ts) {
    console.log(chalk.green('Transform typescript files...'));
    childProcess.execSync(`npx tsc --project ${tsProject}`, {
      stdio: ['inherit', 'inherit', 'inherit']
    });
  }

  // transform files
  console.log(chalk.green('Transform files...'));
  let babel = null;
  if (options.babel) {
    let core = lookupPackage('babel-core');
    if (!core) {
      core = lookupPackage('@babel/core');
    }
    if (!core) throw new Error('Missing babel core, please install @babel/core or babel-core!');
    babel = require(core);
  }

  utils.transformSrouceDir(Path.join(cwd, 'src'), Path.join(cwd, 'dist'), babel);

  // build admin
  console.log(chalk.green('Build admin dashboard...'));
  let adminView = lookupPackage('alaska-admin-view');
  if (!adminView) {
    console.log(chalk.grey('alaska-admin-view is not installed!'));
    return;
  }

  const viewModulesList: string[] = [];
  for (let d of mdirs) {
    fs.readdirSync(d)
      .filter((file) => file[0] !== '.' && file.startsWith('alaska-') && file !== 'alaska-admin-view')
      .forEach((file) => viewModulesList.push(Path.join(d, file)));
  }

  let runtimeStyleFile = Path.join(adminViewRuntime, 'style.scss');

  let styles = viewModulesList.map((dir) => {
    let styleFile = Path.join(dir, 'style.scss');
    if (utils.isFile(styleFile)) {
      let p = slash(Path.relative(Path.dirname(runtimeStyleFile), styleFile));
      return `@import "${p}";`;
    }
    return false;
  }).filter((f) => (f)).join('\n');

  fs.writeFileSync(runtimeStyleFile, styles);

  let views: ViewsMetadata = {
    wrappers: {},
    components: {},
    routes: [],
    widgets: [],
    listTools: [],
    editorTools: [],
    urrc: {}
  };

  function parse(m: ViewsMetadata, dir: string) {
    function lookupFile(file: string) {
      if (Path.isAbsolute(file)) return file;
      return Path.join(dir, file);
    }
    if (m.components) {
      for (let name of Object.keys(m.components)) {
        let view = m.components[name];
        views.components[name] = lookupFile(view);
      }
    }
    if (m.wrappers) {
      for (let name of Object.keys(m.wrappers)) {
        if (!views.wrappers[name]) {
          views.wrappers[name] = [];
        }
        m.wrappers[name].forEach((file) => {
          views.wrappers[name].push(lookupFile(file));
        });
      }
    }
    if (m.urrc) {
      for (let name of Object.keys(m.urrc)) {
        let file = m.urrc[name];
        views.urrc[name] = lookupFile(file);
      }
    }
    if (m.routes) {
      m.routes.forEach((route) => {
        route.component = lookupFile(route.component);
        views.routes.push(route);
      });
    }
    ['widgets', 'listTools', 'editorTools'].forEach((key: string) => {
      // @ts-ignore indexer
      if (m[key]) {
        // @ts-ignore indexer
        m[key].forEach((file) => views[key].push(lookupFile(file)));
      }
    });
  }

  {
    // views 配置文件
    let viewsFile = `${process.cwd()}/src/views/admin-views.js`;
    if (utils.isFile(viewsFile)) {
      parse(require(viewsFile), `${process.cwd()}/src/views`);
    }
  }

  viewModulesList.forEach((dir) => {
    try {
      let viewsDir = Path.join(dir, 'views');
      let viewsFile = Path.join(viewsDir, 'index.js');
      if (utils.isFile(viewsFile)) {
        // 如果views配置文件存在
        parse(require(viewsFile), viewsDir);
      }
      if (utils.isDir(viewsDir)) {
        fs.readdirSync(viewsDir)
          .filter((f) => f[0] !== '.' && /^[A-Z]\w*\.[tj]sx?$/.test(f))
          .forEach((f) => {
            f = f.replace(/\.[tj]sx?$/, '');
            views.components[f] = Path.join(viewsDir, f);
          });
      }
    } catch (err) {
      console.log(err);
    }
  });

  let runtimeViewsFile = Path.join(adminViewRuntime, 'views.js');
  let content = '/* This file is created by alaska build command, please do NOT modify this file manually. */\n\n';

  // 输出views
  content += 'exports.components = {\n';
  for (let name of Object.keys(views.components)) {
    let r = slash(Path.relative(cwd, views.components[name]));
    content += `  ${name}: require('../../${r}').default,\n`;
    console.log(`view : ${name} -> ${r}`);
  }
  content += '};\n\n';

  // 输出urrc
  content += 'exports.urrc = {\n';
  for (let name of Object.keys(views.urrc)) {
    let r = slash(Path.relative(cwd, views.urrc[name]));
    content += `  ${name}: require('../../${r}').default,\n`;
    console.log(`urrc : ${name} -> ${r}`);
  }
  content += '};\n\n';

  // 输出 wrappers
  content += 'exports.wrapper = {\n';
  Object.keys(views.wrappers).forEach((name, index) => {
    console.log(`wrapper : ${name}`);
    content += `  '${name}': [`;
    views.wrappers[name].forEach((file, i) => {
      let r = slash(Path.relative(cwd, file));
      content += ` require('../../${r}').default,`;
      console.log(`\t-> ${r}`);
    });
    content += ' ],\n';
  });
  content += '};\n\n';

  // 输出 routes
  content += 'exports.routes = [\n';
  views.routes.forEach((route, index) => {
    let r = slash(Path.relative(cwd, route.component));
    content += `  {\n    component: require('../../${r}').default,\n    path: '${route.path}'\n  },\n`;
    console.log(`route : ${route.path} -> ${r}`);
  });
  content += '];\n\n';

  function array(key: string) {
    content += `exports.${key} = [\n`;
    // @ts-ignore
    views[key].forEach((file, index) => {
      let r = slash(Path.relative(cwd, file));
      content += `  require('../../${r}').default,\n`;
      console.log(`nav : ${r}`);
    });
    content += '];\n\n';
  }

  array('widgets');
  array('listTools');
  array('editorTools');

  fs.writeFileSync(runtimeViewsFile, content);
}
