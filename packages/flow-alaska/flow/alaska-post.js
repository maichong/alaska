// @flow

declare module 'alaska-post' {
  declare class PostService extends Alaska$Service {
  }
  declare var exports: PostService;
}
declare module 'alaska-post/models/Post' {
  declare class Post extends Alaska$Model {
    title: string;
    user: User;
    cat: Object;
    cats: Object[];
    seoTitle: string;
    seoKeywords: string;
    seoDescription: string;
    summary: string;
    pic: Object;
    content: string;
    tags: Object[];
    source: string;
    commentCount: number;
    hots: number;
    recommend: boolean;
    relations: Object[];
    topics: Object[];
    createdAt: Date;
    preSave():void;
  }
  declare var exports: Class<Post>;
}
declare module 'alaska-post/models/PostCat' {
  declare class PostCat extends Alaska$Model {
    title: string;
    parent: Object;
    subCats: Object[];
    sort: number;
    createdAt: Date;
    preSave():void;
  }
  declare var exports: Class<PostCat>;
}
declare module 'alaska-post/models/PostComment' {
  declare class PostComment extends Alaska$Model {
    post: Object;
    topic: Object;
    user: User;
    content: string;
    commentTo: Object;
    agree: number;
    oppose: number;
    createdAt: Date;
    preSave():void;
  }
  declare var exports: Class<PostComment>;
}
declare module 'alaska-post/models/PostTag' {
  declare class PostTag extends Alaska$Model {
    title: string;
    createdAt: Date;
    preSave():void;
  }
  declare var exports: Class<PostTag>;
}
declare module 'alaska-post/models/PostTopic' {
  declare class PostTopic extends Alaska$Model {
    title: string;
    pic: Object;
    summary: string;
    seoTitle: string;
    seoKeywords: string;
    seoDescription: string;
    commentCount: number;
    hots: number;
    template: string;
    createdAt: Date;
    preSave():void;
  }
  declare var exports: Class<PostTopic>;
}