import { Service } from 'alaska';
import Comment from './models/Comment';

export class CommentService extends Service {
  models: {
    Comment: typeof Comment;
  };
}

declare const commentService: CommentService;

export default commentService;
