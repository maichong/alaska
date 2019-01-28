import * as _ from 'lodash';
import * as collie from 'collie';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { MainService, Extension } from 'alaska';
import { Context } from 'alaska-http';
import { } from 'alaska-react';
import Document, { Head, Foot } from './Document';

export { Document, Head, Foot };

export default class ReactExtension extends Extension {
  static after = ['alaska-http'];

  constructor(main: MainService) {
    super(main);

    collie(main, 'initReact', async () => {
      main.debug('initReact');
      let app = main.app;
      app.use(async (ctx: Context, next) => {
        if (!ctx.state.heads) {
          ctx.state.heads = [];
        }
        if (!ctx.state.foots) {
          ctx.state.foots = [];
        }
        await next();

        let heads: React.ReactElement<any>[] = [];
        let foots: React.ReactElement<any>[] = [];
        function reduce(element: React.ReactElement<any>, level: number): React.ReactElement<any> {
          if (level >= 2 || !element || !element.props || !element.props.children) return element;
          let children = element.props.children;
          if (Array.isArray(children)) {
            let array = [];
            let changed = false;
            for (let child of children) {
              if (!child) continue;
              if (child.type === Head) {
                heads = heads.concat(child.props.children);
                changed = true;
              } if (child.type === Foot) {
                foots = foots.concat(child.props.children);
                changed = true;
              } else {
                let newChild = reduce(child, level + 1);
                array.push(newChild);
                changed = changed || newChild !== child;
              }
            }
            return changed ? React.cloneElement(element, element.props, array) : element;
          }
          if (children.type === Head) {
            heads = heads.concat(children.props.children);
            return null;
          }
          if (children.type === Foot) {
            foots = foots.concat(children.props.children);
            return null;
          }
          let newChild = reduce(children, level + 1);
          return newChild === children ? element : React.cloneElement(element, element.props, newChild);
        }

        if (React.isValidElement(ctx.body)) {
          let body = ctx.body;
          if (body.type !== 'html') {
            body = reduce(body, 0);
            // @ts-ignore children 放在第三个参数
            body = React.createElement(ctx.state.Document || Document, { ctx, heads, foots }, body);
          }
          ctx.body = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(body)}`;
          ctx.type = 'html';
        }
      });
    });

    main.post('initHttp', async () => {
      main.initReact();
    });
  }
}
