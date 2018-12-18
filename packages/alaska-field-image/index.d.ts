import { RecordID, Field } from 'alaska-model';
import { UploadFile } from 'alaska-middleware-upload';
import * as FSD from 'fsd';
import * as mongoose from 'mongoose';

export interface Image {
  _id: RecordID;
  ext: string;
  path: string;
  url: string;
  thumbUrl: string;
  name: string;
  size: number;
}

export interface ImageFieldOptions {
  max: number;
  pathFormat: string;
  thumbSuffix: string;
  allowed: string[];
  adapter: string;
  fs?: any;
  oss?: any;
}

declare class ImageField extends Field {
  fsd: FSD.fsd;
  upload(file: UploadFile): Promise<Image>;
}

interface ImageField extends ImageFieldOptions { }

export default ImageField;
