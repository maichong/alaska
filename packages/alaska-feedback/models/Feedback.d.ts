import { Model, RecordId } from 'alaska-model';

declare class Feedback extends Model { }
interface Feedback extends FeedbackFields { }

export interface FeedbackFields {
  title: string;
  user: RecordId;
  createdAt: Date;
  content: string;
  lastComment: RecordId;
}

export default Feedback;
