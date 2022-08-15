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
  loadResource,
  loadCollection,
  createResource,
  updateResource,
  updateCollection,
  destroyResource,
  patchResource,
} from '../../src/actions/crud';

jest.mock('../../src/selectors', () => ({
  getResourceIsLoaded: jest.fn(),
  getResource: jest.fn(() => () => {}),
  resourceIsLoading: jest.fn(),
  getResourceLoadPromise: jest.fn(),
  getCollectionIsLoaded: jest.fn(),
  getCollection: jest.fn(() => () => []),
  collectionIsLoading: jest.fn(),
  getCollectionLoadPromise: jest.fn(),
}));

const mockFetchPromise = Promise.resolve('res');
jest.mock('../../src/actions/executeFetch', () => jest.fn(() => mockFetchPromise));

const executeFetch = require('../../src/actions/executeFetch');

const dispatch = jest.fn();
const getState = () => 'state';
const resource = 'users';
const id = '123';
const opts = { some: 'opt' };

describe('CRUD actions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadResource', () => {
    it('should load a single resource if it is not loaded or loading', async () => {
      const thunk = loadResource({ resource, id, opts });
      require('../../src/selectors').getResourceIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      require('../../src/selectors').resourceIsLoading.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({
        resource, id, opts, actionType: 'LOAD',
      });
    });

    it('should resolve with the cached resource if it is already loaded', async () => {
      const thunk = loadResource({ resource, id, opts });
      require('../../src/selectors').getResourceIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).not.toHaveBeenCalled();
      expect(executeFetch).not.toHaveBeenCalled();
    });

    it('should reject if the resource is loaded, but it loaded unsuccessfully', async () => {
      const error = new Error('load error');
      try {
        const thunk = loadResource({ resource, id, opts });
        require('../../src/selectors').getResourceIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
        require('../../src/selectors').getResource.mockImplementationOnce(() => () => error); // eslint-disable-line global-require
        await thunk(dispatch, getState);
      } catch (e) {
        expect(e).toBe(error);
        expect(dispatch).not.toHaveBeenCalled();
        expect(executeFetch).not.toHaveBeenCalled();
      }
    });

    it('should return with the loading promise if it is already in progress', async () => {
      const thunk = loadResource({ resource, id, opts });
      require('../../src/selectors').getResourceIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      require('../../src/selectors').resourceIsLoading.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      require('../../src/selectors').getResourceLoadPromise.mockImplementationOnce(() => () => Promise.resolve()); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).not.toHaveBeenCalled();
      expect(executeFetch).not.toHaveBeenCalled();
    });

    it('should refetch the resource if the resource is loaded, but forceFetch is specified', async () => {
      const thunk = loadResource({
        resource, id, opts, forceFetch: true,
      });
      require('../../src/selectors').getResourceIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      require('../../src/selectors').resourceIsLoading.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({
        resource, id, opts, actionType: 'LOAD',
      });
    });

    it('should refetch the resource if a fetch is in progess, but forceFetch is specified', async () => {
      const thunk = loadResource({
        resource, id, opts, forceFetch: true,
      });
      require('../../src/selectors').getResourceIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      require('../../src/selectors').resourceIsLoading.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({
        resource, id, opts, actionType: 'LOAD',
      });
    });
  });

  describe('loadCollection', () => {
    it('should load the collection if it is not loaded or loading', async () => {
      const thunk = loadCollection({ resource, opts });
      require('../../src/selectors').getCollectionIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      require('../../src/selectors').collectionIsLoading.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, opts, actionType: 'LOAD_COLLECTION' });
    });

    it('should not refetch the collection if it is already loaded', async () => {
      const thunk = loadCollection({ resource, opts });
      require('../../src/selectors').getCollectionIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).not.toHaveBeenCalled();
      expect(executeFetch).not.toHaveBeenCalled();
    });

    it('should reject if the collection is loaded, but it loaded unsuccessfully', async () => {
      const error = new Error('load error');
      try {
        const thunk = loadCollection({ resource, id, opts });
        require('../../src/selectors').getCollectionIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
        require('../../src/selectors').getCollection.mockImplementationOnce(() => () => error); // eslint-disable-line global-require
        await thunk(dispatch, getState);
      } catch (e) {
        expect(e).toBe(error);
        expect(dispatch).not.toHaveBeenCalled();
        expect(executeFetch).not.toHaveBeenCalled();
      }
    });

    it('should not refetch the resource if a fetch is already in progress', async () => {
      const thunk = loadCollection({ resource, opts });
      require('../../src/selectors').getCollectionIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      require('../../src/selectors').collectionIsLoading.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      require('../../src/selectors').getCollectionLoadPromise.mockImplementationOnce(() => () => Promise.resolve()); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).not.toHaveBeenCalled();
      expect(executeFetch).not.toHaveBeenCalled();
    });

    it('should load the collection if the collection is loaded, but forceFetch is specified', async () => {
      const thunk = loadCollection({ resource, opts, forceFetch: true });
      require('../../src/selectors').getCollectionIsLoaded.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      require('../../src/selectors').collectionIsLoading.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, opts, actionType: 'LOAD_COLLECTION' });
    });

    it('should refetch the collection if a fetch is in progess, but forceFetch is specified', async () => {
      const thunk = loadCollection({
        resource, id, opts, forceFetch: true,
      });
      require('../../src/selectors').getCollectionIsLoaded.mockImplementationOnce(() => () => false); // eslint-disable-line global-require
      require('../../src/selectors').collectionIsLoading.mockImplementationOnce(() => () => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({
        resource, id, opts, actionType: 'LOAD_COLLECTION',
      });
    });
  });

  describe('createResource', () => {
    it('should create a new resource', async () => {
      const thunk = createResource({ resource, opts });
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, opts, actionType: 'CREATE' });
    });
  });

  describe('update', () => {
    it('should update an existing resource', async () => {
      const thunk = updateResource({ resource, id, opts });
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({
        resource, id, opts, actionType: 'UPDATE',
      });
    });
  });

  describe('update collection', () => {
    it('should update an existing collection', async () => {
      const thunk = updateCollection({ resource, id, opts });
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({
        resource, id, opts, actionType: 'UPDATE_COLLECTION',
      });
    });
  });

  describe('destroy', () => {
    it('should destroy an existing resource', async () => {
      const thunk = destroyResource({ resource, id, opts });
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({
        resource, id, opts, actionType: 'DESTROY',
      });
    });
  });

  describe('patch', () => {
    it('should patch an existing resource', async () => {
      const thunk = patchResource({ resource, id, opts });
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({
        resource, id, opts, actionType: 'PATCH',
      });
    });
  });
});
