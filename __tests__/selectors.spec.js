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

import { fromJS } from 'immutable';

import {
  getResourceIdHash,
  getCollectionIdHash,
  getQueryHash,
} from '../src/helpers/hash';
import { configureIguazuREST } from '../src/config';

import {
  resourceIsLoaded,
  getResource,
  resourceIsLoading,
  getResourceLoadPromise,
  collectionIsLoaded,
  getCollection,
  collectionIsLoading,
  getCollectionLoadPromise,
} from '../src/selectors';

const resource = 'users';
const id = '123';
const idHash = getResourceIdHash(id);

describe('selectors', () => {
  beforeAll(() => {
    configureIguazuREST({ getToState: (state) => state.deep.resources });
  });

  describe('resourceIsLoaded', () => {
    it('should return true if the resource is loaded', () => {
      const state = {
        deep: {
          resources: fromJS({
            users: { items: { [idHash]: { id: '123', data: 'data' } } },
          }),
        },
      };
      expect(resourceIsLoaded({ resource, id })(state)).toBe(true);
    });

    it('should return false if the resource is not loaded', () => {
      const state = {
        deep: {
          resources: fromJS({
            users: { items: {} },
          }),
        },
      };
      expect(resourceIsLoaded({ resource, id })(state)).toBe(false);
    });
  });

  describe('getResource', () => {
    it('should return the resource as a pure JS', () => {
      const state = {
        deep: {
          resources: fromJS({
            users: { items: { [idHash]: { id: '123', data: 'data' } } },
          }),
        },
      };
      expect(getResource({ resource, id })(state)).toEqual({ id: '123', data: 'data' });
    });

    it('should return undefined if the resource is not loaded', () => {
      const state = {
        deep: {
          resources: fromJS({
            users: { items: {} },
          }),
        },
      };
      expect(getResource({ resource, id })(state)).toBeUndefined();
    });

    it('should get resource by id object', () => {
      const idObj = { id: 123, param1: 'a', param2: 'b' };
      const idObjHash = getResourceIdHash(idObj);
      const state = {
        deep: {
          resources: fromJS({
            users: { items: { [idObjHash]: { id: '123', data: 'data' } } },
          }),
        },
      };
      expect(getResource({ resource, id: idObj })(state)).toEqual({ id: '123', data: 'data' });
    });

    it('should return an error if the resource failed to load', () => {
      const error = new Error('resource failed to load');
      const state = {
        deep: {
          resources: fromJS({
            users: { error: { [idHash]: error } },
          }),
        },
      };
      expect(getResource({ resource, id })(state)).toBe(error);
    });
  });

  describe('resourceIsLoading', () => {
    it('should return true if the resource is loading', () => {
      const promise = Promise.resolve();
      const state = {
        deep: {
          resources: fromJS({
            users: { loading: { [idHash]: promise } },
          }),
        },
      };
      expect(resourceIsLoading({ resource, id })(state)).toBe(true);
    });

    it('should return true if the resource is loaded with error', () => {
      const error = new Error('resource failed to load');
      const state = {
        deep: {
          resources: fromJS({
            users: { error: { [idHash]: error } },
          }),
        },
      };
      expect(resourceIsLoaded({ resource, id })(state)).toBe(true);
    });

    it('should return false if the resource is not loading', () => {
      const state = {
        deep: {
          resources: fromJS({
            users: { loading: {} },
          }),
        },
      };
      expect(resourceIsLoading({ resource, id })(state)).toBe(false);
    });
  });

  describe('getResourceLoadPromise', () => {
    it('should return the load promise for the resource', () => {
      const promise = Promise.resolve();
      const state = {
        deep: {
          resources: fromJS({
            users: { loading: { [idHash]: promise } },
          }),
        },
      };
      expect(getResourceLoadPromise({ resource, id })(state)).toBe(promise);
    });
  });

  describe('collectionIsLoaded', () => {
    it('should return true if the collection is loaded', () => {
      const collectionIdHash = getCollectionIdHash();
      const queryHash = getQueryHash();
      const state = {
        deep: {
          resources: fromJS({
            users: { collections: { [collectionIdHash]: { [queryHash]: ['123'] } } },
          }),
        },
      };
      expect(collectionIsLoaded({ resource })(state)).toBe(true);
    });

    it('should return true if the collection is loaded with error', () => {
      const collectionIdHash = getCollectionIdHash();
      const queryHash = getQueryHash();
      const error = new Error('resource failed to load');
      const state = {
        deep: {
          resources: fromJS({
            users: {
              collections: {
                [collectionIdHash]: {
                  [queryHash]: {
                    error,
                  },
                },
              },
            },
          }),
        },
      };
      expect(collectionIsLoaded({ resource })(state)).toBe(true);
    });

    it('should return false if the collection is not loaded', () => {
      const state = {
        deep: {
          resources: fromJS({
            users: { loaded: {} },
          }),
        },
      };
      expect(collectionIsLoaded({ resource })(state)).toBe(false);
    });
  });

  describe('getCollection', () => {
    it('should return the collection of resources in a pure JS array', () => {
      const collectionIdHash = getCollectionIdHash();
      const queryHash = getQueryHash();
      const state = {
        deep: {
          resources: fromJS({
            users: {
              items: { 123: { id: '123', data: 'data' } },
              collections: { [collectionIdHash]: { [queryHash]: { associatedIds: ['123'] } } },
            },
          }),
        },
      };
      expect(getCollection({ resource })(state)).toEqual([{ id: '123', data: 'data' }]);
    });

    it('should return the collection load error if it failed to load', () => {
      const collectionIdHash = getCollectionIdHash();
      const queryHash = getQueryHash();
      const error = new Error('resource failed to load');
      const state = {
        deep: {
          resources: fromJS({
            users: {
              collections: {
                [collectionIdHash]: {
                  [queryHash]: {
                    error,
                  },
                },
              },
            },
          }),
        },
      };
      expect(getCollection({ resource })(state)).toEqual(error);
    });
  });

  describe('collectionIsLoading', () => {
    it('should return true if the collection is loading', () => {
      const promise = Promise.resolve();
      const collectionIdHash = getCollectionIdHash();
      const queryHash = getQueryHash();
      const state = {
        deep: {
          resources: fromJS({
            users: { loading: { [collectionIdHash]: { [queryHash]: promise } } },
          }),
        },
      };
      expect(collectionIsLoading({ resource })(state)).toBe(true);
    });

    it('should return false if the collection is not loading', () => {
      const state = {
        deep: {
          resources: fromJS({
            users: { loading: {} },
          }),
        },
      };
      expect(collectionIsLoading({ resource })(state)).toBe(false);
    });
  });

  describe('getCollectionLoadPromise', () => {
    it('should return the load promise for the collection', () => {
      const promise = Promise.resolve();
      const collectionIdHash = getCollectionIdHash();
      const queryHash = getQueryHash();
      const state = {
        deep: {
          resources: fromJS({
            users: { loading: { [collectionIdHash]: { [queryHash]: promise } } },
          }),
        },
      };
      expect(getCollectionLoadPromise({ resource })(state)).toBe(promise);
    });
  });
});
