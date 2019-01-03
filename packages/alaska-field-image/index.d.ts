import { RecordId, Field } from 'alaska-model';
import { UploadFile } from 'alaska-middleware-upload';
import * as FSD from 'fsd';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Image {
  _id: ObjectId;
  user: ObjectId;
  ext?: string;
  path?: string;
  url: string;
  thumbUrl?: string;
  name?: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface ImageFieldOptions {
  max: number;
  driver?: string;
}

declare class ImageField extends Field {
}

interface ImageField extends ImageFieldOptions { }

export default ImageField;
