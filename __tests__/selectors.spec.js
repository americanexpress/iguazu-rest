import { fromJS } from 'immutable';
import hash from 'object-hash';

import { getIdHash } from '../src/helpers/hash';
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
const idHash = getIdHash(id);

describe('selectors', () => {
  beforeAll(() => {
    configureIguazuREST({ getToState: state => state.deep.resources });
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
      const collectionIdHash = hash({});
      const queryHash = hash({});
      const state = {
        deep: {
          resources: fromJS({
            users: { collections: { [collectionIdHash]: { [queryHash]: ['123'] } } },
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
      const collectionIdHash = hash({});
      const queryHash = hash({});
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
      const error = new Error('load error');
      const collectionIdHash = hash({});
      const queryHash = hash({});
      const state = {
        deep: {
          resources: fromJS({
            users: {
              items: {},
              collections: { [collectionIdHash]: { [queryHash]: { error } } },
            },
          }),
        },
      };
      expect(getCollection({ resource })(state)).toBe(error);
    });
  });

  describe('collectionIsLoading', () => {
    it('should return true if the collection is loading', () => {
      const promise = Promise.resolve();
      const collectionIdHash = hash({});
      const queryHash = hash({});
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
      const collectionIdHash = hash({});
      const queryHash = hash({});
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
