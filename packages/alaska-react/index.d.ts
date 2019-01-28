import * as React from 'react';
import { Extension } from 'alaska';
import { Context } from 'alaska-http';

declare module 'alaska' {
  export interface MainService {
    initReact(): Promise<void>;
  }
}

declare module 'alaska-http' {
  export interface ContextState {
    Document?: React.ComponentClass<DocumentProps>;
    // 页面标题
    documentTitle?: string;
    // 页面描述
    documentDescription?: string;
    // 页面body元素className
    bodyClass?: string;
    /**
     * 页头React元素列表
     */
    heads?: React.ReactElement<any>[];
    /**
     * 页脚React元素列表
     */
    foots?: React.ReactElement<any>[];
  }
}

export interface DocumentProps {
  heads: React.ReactElement<any>[];
  foots: React.ReactElement<any>[];
  children: React.ReactElement<any>;
  ctx: Context;
}

export default class ReactExtension extends Extension { }

export class Document extends React.Component<DocumentProps> { }

export class Head extends React.Component<{}> { }

export class Foot extends React.Component<{}> { }
