import { Service } from 'alaska';
import Post from './models/Post';
import PostCat from './models/PostCat';
import PostComment from './models/PostComment';
import PostTag from './models/PostTag';
import PostTopic from './models/PostTopic';
import { Context } from 'alaska-http';

declare class PostService extends Service {
  models: {
    Post: typeof Post;
    PostCat: typeof PostCat;
    PostComment: typeof PostComment;
    PostTag: typeof PostTag;
    PostTopic: typeof PostTopic;
  }
}

export default PostService;

// Sleds

export interface UpdateCatRefParams {
  ctx: Context;
  cat: string;
}
