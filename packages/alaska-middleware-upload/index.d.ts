import { ObjectMap } from 'alaska';
import { MiddlewareGenerator, MiddlewareConfig } from 'alaska-http';
import { ReadStream } from 'fs';

declare module 'alaska-http' {
  export interface AlaskaContext {
    files: ObjectMap<UploadFile | UploadFile[]>;
  }
}

export interface UploadFile extends ReadStream {
  fieldname: string;
  filename: string;
  encoding: string;
  transferEncoding: string;
  mime: string;
  mimeType: string;
}

export interface UploadMiddlewareConfig extends MiddlewareConfig {
}

declare const uploadMiddleware: MiddlewareGenerator<UploadMiddlewareConfig>;

export default uploadMiddleware;
