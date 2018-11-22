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
    Document?: React.Component<DocumentProps>;
    // 页面标题
    documentTitle?: string;
    // 页面描述
    documentDescription?: string;
    // 页面head中需要加载的自定义元素
    headElements?: React.ReactNode[];
    // 页面head中需要加载的meta
    headMetas?: Meta[];
    // 页面head中需要加载的CSS等资源
    headLinks?: Link[];
    // 页面head中需要加载的JS脚本
    headScripts?: Script[];
    // 页面中需要加载的JS脚本
    bodyScripts?: Script[];
    // 页面body元素className
    bodyClass?: string;
  }
}

export interface Meta {
  charset?: string;
  name?: string;
  content?: string;
  itemprop?: string;
  'http-equiv'?: string;
}

export interface Link {
  href: string;
  ref?: string;
  as?: string;
  crossorigin?: string;
  disabled?: string;
  hreflang?: string;
  integrity?: string;
  media?: string;
  methods?: string;
  prefetch?: string;
  referrerpolicy?: string;
  rel?: string;
  sizes?: string;
  type?: string;
}

export interface Script {
  src?: string;
  content?: string;
  async?: boolean;
  defer?: boolean;
  noModule?: boolean;
  crossOrigin?: string;
  integrity?: string;
  referrerPolicy?: string;
  text?: string;
  type?: string;
}

export interface ScriptProps extends Script { }

export interface DocumentProps {
  children: React.ReactElement<any>;
  ctx: Context;
}

export default class ReactExtension extends Extension { }
