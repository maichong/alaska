declare module 'alaska-feedback' {
  declare class FeedbackService extends Alaska$Service {
  }

  declare var exports: FeedbackService;
}
declare module 'alaska-feedback/models/Feedback' {
  declare class Feedback extends Alaska$Model {
    title: string;
    user: Object;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    lastComment: Object;
    newComment(): void;
    preSave(): void;
  }

  declare var exports: Class<Feedback>;
}
declare module 'alaska-feedback/models/FeedbackComment' {
  declare class FeedbackComment extends Alaska$Model {
    feedback: Object;
    user: Object;
    createdAt: Date;
    fromAdmin: boolean;
    content: string;
    preSave(): void;
  }

  declare var exports: Class<FeedbackComment>;
}
