import { Model, RecordId } from 'alaska-model';

declare class FeedbackComment extends Model { }
interface FeedbackComment extends FeedbackCommentFields { }

export interface FeedbackCommentFields {
  feedback: RecordId;
  user: RecordId;
  createdAt: Date;
  fromAdmin: boolean;
  content: string;
}

export default FeedbackComment;
