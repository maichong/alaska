import * as _ from 'lodash';
import * as React from 'react';
import { DocumentProps } from 'alaska-react';

function onlyReactElement(
  list: React.ReactElement<any>[],
  child: React.ReactChild,
): React.ReactElement<any>[] {
  if (typeof child === 'string' || typeof child === 'number') {
    return list;
  }
  if (child.type === React.Fragment) {
    return list.concat(
      React.Children.toArray(child.props.children).reduce((
        fragmentList: React.ReactElement<any>[],
        fragmentChild: React.ReactChild,
      ): React.ReactElement<any>[] => {
        if (
          typeof fragmentChild === 'string' ||
          typeof fragmentChild === 'number'
        ) {
          return fragmentList;
        }
        return fragmentList.concat(fragmentChild);
      }, []),
    );
  }
  return list.concat(child);
}

const METATYPES = ['name', 'httpEquiv', 'charSet', 'itemProp'];

function unique() {
  const keys = new Set();
  const tags = new Set();
  const metaTypes = new Set();
  const metaCategories: { [metatype: string]: Set<string> } = {};

  return (h: React.ReactElement<any>): boolean => {
    if (h.key && typeof h.key !== 'number') {
      if (keys.has(h.key)) return false;
      keys.add(h.key);
      return true;
    }
    switch (h.type) {
      case 'title':
      case 'base':
        if (tags.has(h.type)) return false;
        tags.add(h.type);
        break;
      case 'meta':
        for (let metatype of METATYPES) {
          if (!h.props.hasOwnProperty(metatype)) continue;
          if (metatype === 'charSet') {
            if (metaTypes.has(metatype)) return false;
            metaTypes.add(metatype);
          } else {
            const category = h.props[metatype];
            const categories = metaCategories[metatype] || new Set();
            if (categories.has(category)) return false;
            categories.add(category);
            metaCategories[metatype] = categories;
          }
        }
        break;
    }
    return true;
  };
}

export default class Document extends React.Component<DocumentProps> {
  render() {
    const { ctx, heads, foots, children } = this.props;
    const { state } = ctx;
    let headers = [
      <meta key="charSet" charSet="utf-8" />
    ];

    if (state.documentTitle) {
      headers.push(<title>{state.documentTitle}</title>);
    }

    if (state.documentDescription) {
      headers.push(<meta name="Description" content={state.documentDescription} />);
    }

    return (
      <html lang={ctx.locale}>
        <head>
          {
            headers.concat(heads)
              .concat(ctx.state.heads)
              .reduce(onlyReactElement, [])
              .reverse()
              .filter(unique())
              .reverse()
              .map((el, index) => {
                const key = el.key || index;
                return React.cloneElement(el, { key });
              })
          }
        </head>
        <body className={state.bodyClass}>
          <div id="__viewport">{children}</div>
          {
            ([] as React.ReactElement<any>[]).concat(ctx.state.foots)
              .concat(foots)
              .reduce(onlyReactElement, [])
              .reverse()
              .filter(unique())
              .reverse()
              .map((el, index) => {
                const key = el.key || index;
                return React.cloneElement(el, { key });
              })
          }
        </body>
      </html>
    );
  }
}

export class Head extends React.Component<{}> {
  render(): null {
    return null;
  }
}

export class Foot extends React.Component<{}> {
  render(): null {
    return null;
  }
}
