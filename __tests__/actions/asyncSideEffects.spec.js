/*
 * Copyright 2018 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import {
  handleQueryPromiseRejection,
  waitAndDispatchFinished,
} from '../../src/actions/asyncSideEffects';

import * as types from '../../src/types';

describe('async side effectsQuery', () => {
  describe('handleQueryPromiseRejection', () => {
    it('should catch the passed promise', async () => {
      expect.assertions(1);
      await expect(handleQueryPromiseRejection(Promise.reject())).resolves.toBeUndefined();
    });
  });

  describe('waitAndDispatchFinished', () => {
    const dispatch = jest.fn();

    it('should dispatch the passed action along with data that was successfully loaded', async () => {
      expect.assertions(1);
      const action = { type: 'LOAD_RESOURCE' };
      const promise = Promise.resolve('async data');
      const thunk = waitAndDispatchFinished(promise, action);
      await thunk(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: types.LOAD_RESOURCE_FINISHED, data: 'async data' });
    });

    it('should dispatch the passed action along with the error when the load failed', async () => {
      expect.assertions(1);
      const action = { type: 'LOAD_RESOURCE' };
      const error = new Error('async error');
      const promise = Promise.reject(error);
      const thunk = waitAndDispatchFinished(promise, action);
      await thunk(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: types.LOAD_RESOURCE_ERROR, data: error });
    });
  });
});
