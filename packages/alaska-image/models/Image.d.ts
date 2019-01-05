import { Model, RecordId } from 'alaska-model';

declare class Image extends Model { }
interface Image extends ImageFields { }

export interface ImageFields {
  user: RecordId;
  name: string;
  ext: string;
  path: string;
  url: string;
  thumbUrl: string;
  size: number;
  width: number;
  height: number;
  createdAt: Date;
}

export default Image;
