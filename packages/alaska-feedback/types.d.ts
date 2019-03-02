
export interface Feedback {
  id: string;
  title: string;
  user: string;
  createdAt: string;
  content: string;
  lastComment: string;
}

export interface FeedbackComment {
  id: string;
  feedback: string;
  user: string;
  createdAt: string;
  fromAdmin: boolean;
  content: string;
}
