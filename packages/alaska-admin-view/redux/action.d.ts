import { Action } from 'redux-actions';
import { ActionState, ActionRequestPayload } from '..';

export function actionRequest(payload: ActionRequestPayload): Action<ActionRequestPayload>;
export function actionSuccess(result: any): Action<any>;
export function actionFailure(error: Error): Action<Error>;
export function execAction(payload: ActionRequestPayload): Promise<any>;
