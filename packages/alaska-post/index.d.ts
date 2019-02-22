import { Service } from 'alaska';
import Post from './models/Post';
import { Context } from 'alaska-http';

export class PostService extends Service {
  models: {
    Post: typeof Post;
  }
}

declare const postService: PostService;

export default postService;
