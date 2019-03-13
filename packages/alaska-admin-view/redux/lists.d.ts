import { Action } from 'redux-actions';
import { ClearListPayload, LoadListPayload, LoadMorePayload } from '..';

export function clearList(payload: ClearListPayload): Action<ClearListPayload>;
export function loadList(payload: LoadListPayload): Action<LoadListPayload>;
export function loadMore(payload: LoadMorePayload): Action<LoadMorePayload>;
