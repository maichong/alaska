import { Service } from 'alaska';
import Post from './models/Post';
import PostCat from './models/PostCat';
import PostComment from './models/PostComment';
import PostTag from './models/PostTag';
import PostTopic from './models/PostTopic';
import { Context } from 'alaska-http';

export class PostService extends Service {
  models: {
    Post: typeof Post;
    PostCat: typeof PostCat;
    PostComment: typeof PostComment;
    PostTag: typeof PostTag;
    PostTopic: typeof PostTopic;
  }
}

declare const postService: PostService;

export default postService;

// Sleds

export interface UpdateCatRefParams {
  ctx: Context;
  cat: string;
}
