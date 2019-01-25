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
  id?: string;
  src?: string;
  dist?: string;
  config?: string;
  modulesDirs?: string[];
  ts?: boolean | string;
  babel?: boolean;
  skipTransform?: boolean;
  skipAdminView?: boolean;
}

export default async function build(options: BuildOptions) {
  console.log(chalk.green('Alaska build...'));
  const cwd = process.cwd();
  const src = options.src || 'src';
  const dist = options.dist || 'dist';
  const srcDir = Path.join(cwd, src);
  const distDir = Path.join(cwd, dist);
  const runtimeDir = Path.join(cwd, 'runtime');
  const nodeModulesDir = Path.join(cwd, 'node_modules');
  let id = options.id;

  let pkgFile = Path.join(cwd, 'package.json');
  if (!utils.isFile(pkgFile)) {
    throw new Error('Current folder is not an alaska project, missing package.json');
  }

  if (!id) {
    let pkg = utils.readJSON(pkgFile);
    id = pkg.name;
  }

  process.env.ALASKA_BUILD = id;

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

  const runtimeAdminViewDir = Path.join(runtimeDir, 'alaska-admin-view');
  if (!options.skipAdminView) {
    if (!utils.isDir(runtimeAdminViewDir)) {
      mkdirp.sync(runtimeAdminViewDir);
    }

    // views.d.ts
    fs.writeFileSync(`${runtimeAdminViewDir}/views.d.ts`, `import { Views } from 'alaska-admin-view';\ndeclare const views: Views;\nexport = views;`);
  }

  // build modules
  console.log(chalk.green('Build modules...'));
  let alaskaModulesPath = lookupPackage('alaska-modules');
  if (!alaskaModulesPath) {
    console.log(chalk.red('alaska-modules is not installed!'));
  } else {
    const create: createMetadata = require(Path.join(alaskaModulesPath)).createMetadata;
    let configFile = options.config;
    if (!configFile) {
      // `${src}/config/${id}.js`
      const configDir = Path.join(src, 'config');
      if (fs.existsSync(Path.join(`${configDir}/${id}.js`)) || fs.existsSync(`${configDir}/${id}.ts`)) {
        configFile = id;
      } else {
        throw new Error(`Can not resolve config file: ${configDir}/${id}.[js|ts]`);
      }
    }
    let script = await create(id, srcDir, configFile, options.modulesDirs).toScript();
    fs.writeFileSync(`${srcDir}/modules.js`, script);
    fs.writeFileSync(`${srcDir}/modules.d.ts`, `import { Modules } from 'alaska-modules';\ndeclare const modules: Modules;\nexport default modules;`);
  }

  if (!options.skipTransform) {
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

    utils.transformSrouceDir(srcDir, distDir, babel);
  }

  if (options.skipAdminView) return;

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

  let runtimeStyleFile = Path.join(runtimeAdminViewDir, 'style.scss');

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
    let viewsFile = `${srcDir}/views/admin-views.js`;
    if (utils.isFile(viewsFile)) {
      parse(require(viewsFile), `${srcDir}/views`);
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

  function requireFile(file: string) {
    let r = slash(Path.relative(nodeModulesDir, file));
    if (r[0] !== '.') return r;
    return slash(Path.relative(runtimeAdminViewDir, file));
  }

  let runtimeViewsFile = Path.join(runtimeAdminViewDir, 'views.js');
  let content = '/* This file is created by alaska build command, please do NOT modify this file manually. */\n\n';

  // 输出views
  content += 'exports.components = {\n';
  for (let name of Object.keys(views.components)) {
    let r = requireFile(views.components[name]);
    content += `  ${name}: require('${r}').default,\n`;
    console.log(`view : ${name} -> ${Path.relative(cwd, views.components[name])}`);
  }
  content += '};\n\n';

  // 输出urrc
  content += 'exports.urrc = {\n';
  for (let name of Object.keys(views.urrc)) {
    let r = requireFile(views.urrc[name]);
    content += `  ${name}: require('${r}').default,\n`;
    console.log(`urrc : ${name} -> ${Path.relative(cwd, views.urrc[name])}`);
  }
  content += '};\n\n';

  // 输出 wrappers
  content += 'exports.wrappers = {\n';
  Object.keys(views.wrappers).forEach((name, index) => {
    console.log(`wrapper : ${name}`);
    content += `  '${name}': [`;
    views.wrappers[name].forEach((file, i) => {
      let r = requireFile(file);
      content += ` require('${r}').default,`;
      console.log(`\t-> ${Path.relative(cwd, file)}`);
    });
    content += ' ],\n';
  });
  content += '};\n\n';

  // 输出 routes
  content += 'exports.routes = [\n';
  views.routes.forEach((route, index) => {
    let r = requireFile(route.component);
    content += `  {\n    component: require('${r}').default,\n    path: '${route.path}'\n  },\n`;
    console.log(`route : ${route.path} -> ${Path.relative(cwd, route.component)}`);
  });
  content += '];\n\n';

  function array(key: string) {
    content += `exports.${key} = [\n`;
    // @ts-ignore
    views[key].forEach((file, index) => {
      let r = requireFile(file);
      content += `  require('${r}').default,\n`;
      console.log(`${key} : ${Path.relative(cwd, file)}`);
    });
    content += '];\n\n';
  }

  array('widgets');
  array('listTools');
  array('editorTools');

  fs.writeFileSync(runtimeViewsFile, content);
}
