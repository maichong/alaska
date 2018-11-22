import { ObjectMap } from 'alaska';
import { MiddlewareGenerator, MiddlewareOptions } from 'alaska-http';
import { ReadStream } from 'fs';

declare module 'alaska-http' {
  interface Context {
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

export interface UploadMiddlewareOptions extends MiddlewareOptions {
}

declare const uploadMiddleware: MiddlewareGenerator<UploadMiddlewareOptions>;

export default uploadMiddleware;
