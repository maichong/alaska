import { Service } from 'alaska';
import Feedback from './models/Feedback';

export class FeedbackService extends Service {
  models: {
    Feedback: typeof Feedback;
  };
}

declare const feedbackService: FeedbackService;

export default feedbackService;
