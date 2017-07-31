import { fromJS } from 'immutable';
import hash from 'object-hash';

import { getIdHash } from '../src/helpers/hash';

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
const idHash = getIdHash(id);

describe('selectors', () => {
  describe('resourceIsLoaded', () => {
    it('should return true if the resource is loaded', () => {
      const state = {
        resources: fromJS({
          users: { items: { [idHash]: { id: '123', data: 'data' } } },
        }),
      };
      expect(resourceIsLoaded({ state, resource, id })).toBe(true);
    });

    it('should return false if the resource is not loaded', () => {
      const state = {
        resources: fromJS({
          users: { items: {} },
        }),
      };
      expect(resourceIsLoaded({ state, resource, id })).toBe(false);
    });
  });

  describe('getResource', () => {
    it('should return the resource as a pure JS', () => {
      const state = {
        resources: fromJS({
          users: { items: { [idHash]: { id: '123', data: 'data' } } },
        }),
      };
      expect(getResource({ state, resource, id })).toEqual({ id: '123', data: 'data' });
    });

    it('should return undefined if the resource is not loaded', () => {
      const state = {
        resources: fromJS({
          users: { items: {} },
        }),
      };
      expect(getResource({ state, resource, id })).toBeUndefined();
    });
  });

  describe('resourceIsLoading', () => {
    it('should return true if the resource is loading', () => {
      const promise = Promise.resolve();
      const state = {
        resources: fromJS({
          users: { loading: { [idHash]: promise } },
        }),
      };
      expect(resourceIsLoading({ state, resource, id })).toBe(true);
    });

    it('should return false if the resource is not loading', () => {
      const state = {
        resources: fromJS({
          users: { loading: {} },
        }),
      };
      expect(resourceIsLoading({ state, resource, id })).toBe(false);
    });
  });

  describe('getResourceLoadPromise', () => {
    it('should return the load promise for the resource', () => {
      const promise = Promise.resolve();
      const state = {
        resources: fromJS({
          users: { loading: { [idHash]: promise } },
        }),
      };
      expect(getResourceLoadPromise({ state, resource, id })).toBe(promise);
    });
  });

  describe('collectionIsLoaded', () => {
    it('should return true if the collection is loaded', () => {
      const collectionIdHash = hash({});
      const queryHash = hash({});
      const state = {
        resources: fromJS({
          users: { collections: { [collectionIdHash]: { [queryHash]: ['123'] } } },
        }),
      };
      expect(collectionIsLoaded({ state, resource })).toBe(true);
    });

    it('should return false if the collection is not loaded', () => {
      const state = {
        resources: fromJS({
          users: { loaded: {} },
        }),
      };
      expect(collectionIsLoaded({ state, resource })).toBe(false);
    });
  });

  describe('getCollection', () => {
    it('should return the collection of resources in a pure JS array', () => {
      const collectionIdHash = hash({});
      const queryHash = hash({});
      const state = {
        resources: fromJS({
          users: {
            items: { 123: { id: '123', data: 'data' } },
            collections: { [collectionIdHash]: { [queryHash]: { associatedIds: ['123'] } } },
          },
        }),
      };
      expect(getCollection({ state, resource })).toEqual([{ id: '123', data: 'data' }]);
    });

    it('should return the collection load error if it failed to load', () => {
      const error = new Error('load error');
      const collectionIdHash = hash({});
      const queryHash = hash({});
      const state = {
        resources: fromJS({
          users: {
            items: {},
            collections: { [collectionIdHash]: { [queryHash]: { error } } },
          },
        }),
      };
      expect(getCollection({ state, resource })).toBe(error);
    });
  });

  describe('collectionIsLoading', () => {
    it('should return true if the collection is loading', () => {
      const promise = Promise.resolve();
      const collectionIdHash = hash({});
      const queryHash = hash({});
      const state = {
        resources: fromJS({
          users: { loading: { [collectionIdHash]: { [queryHash]: promise } } },
        }),
      };
      expect(collectionIsLoading({ state, resource })).toBe(true);
    });

    it('should return false if the collection is not loading', () => {
      const state = {
        resources: fromJS({
          users: { loading: {} },
        }),
      };
      expect(collectionIsLoading({ state, resource })).toBe(false);
    });
  });

  describe('getCollectionLoadPromise', () => {
    it('should return the load promise for the collection', () => {
      const promise = Promise.resolve();
      const collectionIdHash = hash({});
      const queryHash = hash({});
      const state = {
        resources: fromJS({
          users: { loading: { [collectionIdHash]: { [queryHash]: promise } } },
        }),
      };
      expect(getCollectionLoadPromise({ state, resource })).toBe(promise);
    });
  });
});
