import { UploadOptions, UploadResult } from '..';
import api from './api';

export default function upload(options: UploadOptions): Promise<UploadResult> {
  return api.post('/upload', {
    query: {
      _model: options.model,
      _field: options.field,
      _id: options.id
    },
    body: {
      file: options.file
    }
  });
}
