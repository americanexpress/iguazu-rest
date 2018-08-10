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

import config from '../../src/config';
import * as types from '../../src/types';

import executeFetch from '../../src/actions/executeFetch';

jest.mock('../../src/actions/asyncSideEffects', () => ({
  waitAndDispatchFinished: jest.fn(() => 'waitAndDispatchFinishedThunk'),
}));

Date.now = jest.fn(() => 'now');
const dispatch = jest.fn();
const getState = () => {};
const resource = 'users';
const id = '123';
const opts = { some: 'opt' };

describe('executeFetch', () => {
  afterEach(() => {
    fetch.resetMocks();
    jest.clearAllMocks();
  });

  describe('default behavior', () => {
    it('should handle an ok response', async () => {
      Object.assign(config, {
        defaultOpts: { default: 'opt' },
        resources: {
          users: {
            fetch: () => ({
              url: 'http://api.domain.com/users/:id',
              opts: {
                resource: 'opt',
              },
            }),
          },
        },
      });
      fetch.mockResponseOnce(
        JSON.stringify({ id: '123', name: 'joe' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
      const thunk = executeFetch({ resource, id, opts, actionType: 'LOAD' });
      const data = await thunk(dispatch, getState);
      expect(data).toEqual({ id: '123', name: 'joe' });
      expect(fetch).toHaveBeenCalledWith(
        'http://api.domain.com/users/123',
        { default: 'opt', method: 'GET', resource: 'opt', some: 'opt' }
      );
      const promise = Promise.resolve(data);
      expect(dispatch).toHaveBeenCalledWith({
        type: types.LOAD_STARTED,
        resource,
        id,
        opts,
        promise,
      });
      expect(dispatch).toHaveBeenCalledWith('waitAndDispatchFinishedThunk');
    });

    it('should handle bad response', async () => {
      Object.assign(config, {
        defaultOpts: undefined,
        resources: {
          users: {
            fetch: () => ({
              url: 'http://api.domain.com/users/:id',
            }),
          },
        },
      });
      fetch.mockResponseOnce('body', { status: 500, statusText: 'Internal Server Error', url: 'url' });
      const error = new Error('Internal Server Error (url)');
      const promise = Promise.reject(error);
      const thunk = executeFetch({ resource, actionType: 'LOAD_COLLECTION' });
      try {
        await thunk(dispatch, getState);
      } catch (e) {
        expect(dispatch).toHaveBeenCalledWith({
          type: types.LOAD_COLLECTION_STARTED,
          resource,
          promise,
        });
        expect(dispatch).toHaveBeenCalledWith('waitAndDispatchFinishedThunk');
        expect(e).toEqual(error);
        expect(e.status).toEqual(500);
        expect(e.body).toEqual('body');
        promise.catch(() => 'caught promise error'); // catch promise so unhandled promise doesn't show up in console
      }
    });

    it('should use a data transformer if one is configured', async () => {
      Object.assign(config, {
        resources: {
          users: {
            fetch: () => ({ url: 'http://api.domain.com/users/:id' }),
            transformData: (data, { actionType }) =>
              (actionType === 'LOAD_COLLECTION' ? data.actualCollection : data),
          },
        },
      });
      fetch.mockResponseOnce(
        JSON.stringify({
          some: 'meta',
          actualCollection: [{ id: '123', name: 'joe' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
      const thunk = executeFetch({ resource, id, opts, actionType: 'LOAD_COLLECTION' });
      const data = await thunk(dispatch, getState);
      expect(data).toEqual([{ id: '123', name: 'joe' }]);
    });
  });
});
