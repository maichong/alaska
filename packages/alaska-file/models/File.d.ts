import { Model, RecordId } from 'alaska-model';

declare class File extends Model { }
interface File extends FileFields { }

export interface FileFields {
  user: RecordId;
  name: string;
  ext: string;
  path: string;
  url: string;
  size: number;
  createdAt: Date;
}

export default File;
