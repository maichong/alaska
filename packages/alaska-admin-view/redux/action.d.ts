import { Action } from 'redux-actions';
import { ActionState, ActionRequestPayload } from '..';

export function actionRequest(req: ActionRequestPayload): Action<ActionRequestPayload>;
export function actionSuccess(result: any): Action<any>;
export function actionFailure(error: Error): Action<Error>;
