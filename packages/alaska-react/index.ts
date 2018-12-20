import * as _ from 'lodash';
import * as collie from 'collie';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { MainService, Extension } from 'alaska';
import { Context } from 'alaska-http';
import { } from 'alaska-react';
import Document from './Document';

export default class ReactExtension extends Extension {
  static after = ['alaska-http'];

  constructor(main: MainService) {
    super(main);

    collie(main, 'initReact', async () => {
      main.debug('initReact');
      let app = main.app;
      app.use(async (ctx: Context, next) => {
        if (!ctx.state.headElements) {
          ctx.state.headElements = [];
        }
        if (!ctx.state.headMetas) {
          ctx.state.headMetas = [];
        }
        if (!ctx.state.headLinks) {
          ctx.state.headLinks = [];
        }
        if (!ctx.state.headScripts) {
          ctx.state.headScripts = [];
        }
        if (!ctx.state.bodyScripts) {
          ctx.state.bodyScripts = [];
        }
        await next();
        if (React.isValidElement(ctx.body)) {
          let element = React.createElement(ctx.state.Document || Document, { ctx }, ctx.body);
          ctx.body = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(element)}`;
          ctx.type = 'html';
        }
      });
    });

    main.post('initHttp', async () => {
      main.initReact();
    });
  }
}
