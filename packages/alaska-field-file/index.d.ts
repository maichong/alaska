import { RecordId, Field } from 'alaska-model';
import * as FSD from 'fsd';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface File {
  _id: ObjectId;
  user: ObjectId;
  ext?: string;
  path?: string;
  url: string;
  name?: string;
  size?: number;
}

export interface FileFieldOptions {
  max: number;
  driver?: string;
}

declare class FileField extends Field {
}

interface FileField extends FileFieldOptions { }

export default FileField;
