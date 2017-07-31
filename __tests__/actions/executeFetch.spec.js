import hash from 'object-hash';

import config from '../../src/config';
import types from '../../src/types';

import executeFetch from '../../src/actions/executeFetch';

Date.now = jest.fn(() => 'now');
const dispatch = jest.fn();
const getState = () => {};
const resource = 'users';
const id = '123';
const idHash = hash({ id: '123' });
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
      expect(dispatch).toHaveBeenCalledWith({
        type: types.LOAD_STARTED,
        resource,
        id,
        idHash,
        opts,
        promise: Promise.resolve(data),
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: types.LOAD_FINISHED,
        resource,
        id,
        idHash,
        opts,
        data,
        receivedAt: 'now',
      });
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
          idHash: hash({}),
          promise,
        });
        expect(dispatch).toHaveBeenCalledWith({
          type: types.LOAD_COLLECTION_FINISHED,
          resource,
          idHash: hash({}),
          data: error,
          receivedAt: 'now',
        });
        expect(e).toEqual(error);
        expect(e.status).toEqual(500);
        expect(e.body).toEqual('body');
      }
    });
  });
});
