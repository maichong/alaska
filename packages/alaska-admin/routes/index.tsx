import * as React from 'react';
import { Router } from 'alaska-http';
import * as Path from 'path';
import * as fs from 'fs';
import * as hasha from 'hasha';
import * as tr from 'grackle';
import service from '..';

let jsHash = '';
let cssHash = '';

export default function (router: Router) {
  router.get('/', (ctx) => {
    ctx.service = service;
    if (!ctx.path.endsWith('/')) {
      ctx.redirect(`${ctx.path}/`);
      return;
    }
    const min = ctx.state.env === 'production' ? '.min' : '';
    const resourceVersion = service.config.get('resourceVersion');

    if (!jsHash && !resourceVersion) {
      try {
        jsHash = hasha(fs.readFileSync(`public/admin/app${min}.js`), {
          algorithm: 'md5'
        }).substr(0, 8);
      } catch (e) {
        jsHash = '-';
      }
    }
    if (!cssHash && !resourceVersion) {
      try {
        cssHash = hasha(fs.readFileSync(`public/admin/app.css`), {
          algorithm: 'md5'
        }).substr(0, 8);
      } catch (e) {
        cssHash = '-';
      }
    }

    let prefix = service.config.get('prefix', '');

    if (prefix === '/') {
      prefix = '';
    }

    ctx.state.documentTitle = service.config.get('dashboardTitle');

    ctx.state.headMetas.push({
      name: 'viewport',
      content: 'initial-scale=0.8,maximum-scale=0.8,user-scalable=no'
    });
    ctx.state.headElements.push(<style key="admin-loading">{`
body{background:#eaf0f5}
.loading{margin-top: 100px;}
.loading .loading-text{
  width: 300px;
  height: 60px;
  line-height: 70px;
  background: url(img/loading.gif) left center no-repeat;
  padding-left: 120px;
  color: #333;
  font-size: 26px;
  font-weight: 100;
  margin: 0 auto;
  letter-spacing: 4px;
}
    `}</style>);
    ctx.state.headScripts.push({
      content: `var PREFIX='${prefix}';`
    });
    ctx.state.bodyScripts.push({
      src: Path.join(prefix, `/app${min}.js?${resourceVersion || jsHash}`)
    });
    ctx.state.headLinks.push({
      rel: 'stylesheet',
      type: 'text/css',
      href: Path.join(prefix, `/app.css?${resourceVersion || cssHash}`)
    });

    ctx.body = (
      <div className="loading">
        <div className="loading-text">{tr.locale(ctx.locale)('Loading')}</div>
      </div>
    );
  });
}
