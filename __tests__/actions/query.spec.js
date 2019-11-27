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

import { queryResource, queryCollection } from '../../src/actions/query';

const mockLoadPromise = Promise.resolve('data');
jest.mock('../../src/actions/crud', () => ({
  loadResource: jest.fn(() => mockLoadPromise),
  loadCollection: jest.fn(() => mockLoadPromise),
}));

jest.mock('../../src/selectors', () => ({
  getResource: jest.fn(() => () => 'resource'),
  getCollection: jest.fn(() => () => 'collection'),
  resourceIsLoaded: jest.fn(),
  collectionIsLoaded: jest.fn(),
}));

jest.mock('../../src/actions/asyncSideEffects', () => ({
  handleQueryPromiseRejection: jest.fn((promise) => promise.catch(() => { /* swallow */ })),
}));

const dispatch = jest.fn((input) => input);
const getState = () => 'state';
const resource = 'users';
const id = '123';
const opts = 'opts';
const loadError = new Error('Async Load Error');

describe('iguazu query actions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('queryResource', () => {
    it('should return a loading response if the resource is loading', () => {
      require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      const thunk = queryResource({ resource, id, opts });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('resource');
      expect(loadResponse.status).toEqual('loading');
      expect(loadResponse.error).toBeFalsy();
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should return a loaded response if the resource is loaded', () => {
      require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      const thunk = queryResource({ resource, id, opts });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('resource');
      expect(loadResponse.status).toEqual('complete');
      expect(loadResponse.error).toBeFalsy();
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should return a loading response if the resource is loaded, but forceFetch is specified', () => {
      require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      const thunk = queryResource({
        resource, id, opts, forceFetch: true,
      });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('resource');
      expect(loadResponse.status).toEqual('loading');
      expect(loadResponse.error).toBeFalsy();
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should indicate an error occured if applicable', () => {
      require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      require('../../src/selectors').getResource.mockImplementationOnce(() => () => loadError); // eslint-disable-line global-require
      const thunk = queryResource({ resource, id, opts });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.error).toBe(loadError);
    });

    it('should catch the promise if it rejects, but leave the uncaught promise for ssr', async () => {
      expect.assertions(2);
      const { handleQueryPromiseRejection } = require('../../src/actions/asyncSideEffects'); // eslint-disable-line global-require
      let promise;
      try {
        require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
        require('../../src/actions/crud').loadResource.mockImplementationOnce(() => Promise.reject(new Error('async error'))); // eslint-disable-line global-require
        const thunk = queryResource({ resource, id, opts });
        const loadResponse = thunk(dispatch, getState);
        promise = loadResponse.promise;
        await promise;
      } catch (e) {
        expect(handleQueryPromiseRejection).toHaveBeenCalledWith(promise);
        expect(e.message).toBe('async error');
      }
    });
  });

  describe('queryCollection', () => {
    it('should return a loading response if the collection is loading', () => {
      require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      const thunk = queryCollection({ resource, id, opts });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('collection');
      expect(loadResponse.status).toEqual('loading');
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should return a loaded response if the collection is loaded', () => {
      require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      const thunk = queryCollection({ resource, id, opts });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('collection');
      expect(loadResponse.status).toEqual('complete');
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should return a loading response if the collection is loaded, but forceFetch is specified', () => {
      require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      const thunk = queryCollection({
        resource, id, opts, forceFetch: true,
      });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.data).toEqual('collection');
      expect(loadResponse.status).toEqual('loading');
      expect(loadResponse.promise).toEqual(mockLoadPromise);
    });

    it('should indicate an error occured if applicable', () => {
      require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      require('../../src/selectors').getCollection.mockImplementationOnce(() => () => loadError); // eslint-disable-line global-require
      const thunk = queryCollection({ resource, id, opts });
      const loadResponse = thunk(dispatch, getState);
      expect(loadResponse.error).toBe(loadError);
    });

    it('should catch the promise if it rejects, but leave the uncaught promise for ssr', async () => {
      expect.assertions(2);
      const { handleQueryPromiseRejection } = require('../../src/actions/asyncSideEffects'); // eslint-disable-line global-require
      let promise;
      try {
        require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
        require('../../src/actions/crud').loadCollection.mockImplementationOnce(() => Promise.reject(new Error('async error'))); // eslint-disable-line global-require
        const thunk = queryCollection({ resource, id, opts });
        const loadResponse = thunk(dispatch, getState);
        promise = loadResponse.promise;
        await promise;
      } catch (e) {
        expect(handleQueryPromiseRejection).toHaveBeenCalledWith(promise);
        expect(e.message).toBe('async error');
      }
    });
  });
});
