import { Service } from 'alaska';
import Notice from './models/Notice';

export class NoticeService extends Service {
  models: {
    Notice: typeof Notice;
  }
}

declare const noticeService: NoticeService;

export default noticeService;
