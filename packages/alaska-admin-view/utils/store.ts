/*
 * @Author: Chao
 * @Date: 2018-11-01 11:23:37
 * @Last Modified by: Chao
 * @Last Modified time: 2018-11-01 12:44:45
 */

import { Store } from 'redux';
import { State } from '..';

export function getStore(): State {
  // @ts-ignore
  let store: Store = window.store;
  if (store) {
    // @ts-ignore
    return store.getState();
  }
  return null;
}
