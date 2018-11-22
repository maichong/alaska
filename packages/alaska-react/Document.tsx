import * as _ from 'lodash';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { DocumentProps, ScriptProps } from 'alaska-react';
import { ContextState } from 'alaska-http';

export default class Document extends React.Component<DocumentProps> {
  static childContextTypes = {
    _ssr: PropTypes.bool,
    _documentProps: PropTypes.any
  }

  getChildContext() {
    return {
      _ssr: true,
      _documentProps: this.props
    };
  }

  render() {
    const { ctx } = this.props;
    // @ts-ignore
    let lang = ctx.locale || undefined; // eslint-disable-line
    let bodyClass = ctx.state.bodyClass;
    return (
      <html lang={lang}>
        <Head />
        <body className={bodyClass}>
          <Main />
          <BodyScripts />
        </body>
      </html>
    );
  }
}

export class Head extends React.Component<{}> {
  static contextTypes = {
    _documentProps: PropTypes.any
  }

  context: any;
  render() {
    const state: ContextState = this.context._documentProps.ctx.state;

    return (
      <head>
        <meta charSet="utf-8" />
        <title>{state.documentTitle}</title>
        {state.documentDescription && <meta name="Description" content={state.documentDescription} />}
        {state.headElements}
        {_.map(state.headMetas, (meta, i) => <meta key={i} {...meta} />)}
        {_.map(state.headLinks, (link, i) => <link key={i} {...link} />)}
        {_.map(state.headScripts, (script, i) => <Script key={i} {...script} />)}
      </head>
    );
  }
}

export class Main extends React.Component<{}> {
  static contextTypes = {
    _documentProps: PropTypes.any
  }

  context: any;
  render() {
    const documnetProps: DocumentProps = this.context._documentProps;
    return (
      <div id="__viewport">{documnetProps.children}</div>
    );
  }
}

export class BodyScripts extends React.Component<{}> {
  static contextTypes = {
    _documentProps: PropTypes.any
  }

  context: any;
  render() {
    const state: ContextState = this.context._documentProps.ctx.state;
    return _.map(state.bodyScripts, (script, i) => <Script key={i} {...script} />);
  }
}

export class Script extends React.Component<ScriptProps> {
  render() {
    const props = this.props;
    let attrs = _.omit(props, 'content');
    if (props.content) {
      return <script dangerouslySetInnerHTML={{ __html: props.content }} {...attrs} />;
    }
    return <script {...attrs} />;
  }
}
