// @flow

import alaska from 'alaska';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
// $Flow
import Provider from 'react-redux/lib/components/Provider';

export default class ReactPlugin {
  service: Alaska$Service;
  label: string;

  constructor(service: Alaska$Service) {
    this.init(service);
  }

  init(service: Alaska$Service) {
    this.service = service;
    this.label = 'React';

    service.pre('loadRoutes', () => {
      let { router } = service;
      router.use((ctx, next) => {
        function react(view: string, props?: Object = {}): string {
          let mod = alaska.modules.services[service.id];
          let View = mod && mod.reactViews &&
            (
              mod.reactViews[view]
              || mod.reactViews[view + '.jsx']
              || service.panic(`React view "${view}" not found!`)
            );
          try {
            // $Flow
            let element = React.createElement(View, Object.assign({ isSSR: true }, props));
            if (props.store) {
              element = React.createElement(Provider, { store: props.store }, element);
            }
            return ReactDOMServer.renderToStaticMarkup(element);
          } catch (error) {
            console.error(error.stack);
            throw error;
          }
        }

        ctx.react = react;
        ctx.state.react = react;
        return next();
      });
    });
  }
}
