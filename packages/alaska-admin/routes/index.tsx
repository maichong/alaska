import * as React from 'react';
import * as Router from 'koa-router';
import * as Path from 'path';
import * as tr from 'grackle';
import ADMIN from '..';

export default function (router: Router) {
  router.get('/', (ctx) => {
    if (!ctx.path.endsWith('/')) {
      ctx.redirect(ctx.path + '/');
      return;
    }
    const prefix = ADMIN.config.get('prefix', '/');
    const min = ctx.state.env === 'production' ? '.min' : '';

    ctx.state.documentTitle = 'Alaska admin dashboard';

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
      src: Path.join(prefix, `/js/app${min}.js`)
    });

    ctx.body = (
      <div className="loading">
        <div className="loading-text">{tr.locale(ctx.locale)('Loading')}</div>
      </div>
    );
  });
}
