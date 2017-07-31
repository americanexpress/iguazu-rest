import { Map as iMap } from 'immutable';
import hash from 'object-hash';

import {
  LOAD_STARTED,
  LOAD_COLLECTION_STARTED,
  CREATE_STARTED,
  UPDATE_STARTED,
  DESTROY_STARTED,
  LOAD_FINISHED,
  LOAD_COLLECTION_FINISHED,
  CREATE_FINISHED,
  UPDATE_FINISHED,
  DESTROY_FINISHED,
  RESET,
} from '../src/types';

import resourcesReducer, {
  initialResourceState,
  resourceReducer,
} from '../src/reducer';

jest.mock('../src/config', () => ({
  resources: { users: {} },
}));

const id = { id: '123' };
const idHash = hash(id);

describe('reducer', () => {
  describe('resourceReducer', () => {
    it('should handle LOAD_STARTED action', () => {
      const promise = Promise.resolve();
      const action = {
        type: LOAD_STARTED,
        id,
        idHash,
        promise,
      };
      const newState = resourceReducer(initialResourceState, action);
      expect(newState.getIn(['loading', idHash])).toEqual(promise);
    });

    it('should handle LOAD_COLLECTION_STARTED action', () => {
      const promise = Promise.resolve();
      const collectionIdHash = hash({});
      const queryHash = hash({});
      const action = {
        type: LOAD_COLLECTION_STARTED,
        idHash: collectionIdHash,
        promise,
      };
      const newState = resourceReducer(initialResourceState, action);
      expect(newState.getIn(['loading', collectionIdHash, queryHash])).toEqual(promise);
    });

    it('should handle CREATE_STARTED action', () => {
      const promise = Promise.resolve();
      const action = {
        type: CREATE_STARTED,
        promise,
      };
      const newState = resourceReducer(initialResourceState, action);
      expect(newState.get('isCreating')).toEqual(true);
    });

    it('should handle UPDATE_STARTED action', () => {
      const promise = Promise.resolve();
      const action = {
        type: UPDATE_STARTED,
        id,
        idHash,
        promise,
      };
      const newState = resourceReducer(initialResourceState, action);
      expect(newState.getIn(['updating', idHash])).toEqual(promise);
    });

    it('should handle DESTROY_STARTED action', () => {
      const promise = Promise.resolve();
      const action = {
        type: DESTROY_STARTED,
        id,
        idHash,
        promise,
      };
      const newState = resourceReducer(initialResourceState, action);
      expect(newState.getIn(['destroying', idHash])).toEqual(promise);
    });

    it('should handle LOAD_FINISHED action', () => {
      const promise = Promise.resolve();
      const data = { id, some: 'property' };
      const action = {
        type: LOAD_FINISHED,
        id,
        idHash,
        data,
      };
      const initialState = initialResourceState.setIn(['loading', idHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash]).toJS()).toEqual(data);
    });

    it('should handle LOAD_COLLECTION_FINISHED action with a successful response', () => {
      const promise = Promise.resolve();
      const collectionIdHash = hash({});
      const queryHash = hash({});
      const action = {
        type: LOAD_COLLECTION_FINISHED,
        resource: 'users',
        id: {},
        idHash: collectionIdHash,
        data: [{ id: '123' }],
      };
      const initialState = initialResourceState.setIn(['loading', collectionIdHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', collectionIdHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash]).toJS()).toEqual({ id: '123' });
      expect(newState.getIn(['collections', collectionIdHash, queryHash]).toJS()).toEqual({ associatedIds: [idHash] });
    });

    it('should handle LOAD_COLLECTION_FINISHED action with an unsuccessful response', () => {
      const promise = Promise.resolve();
      const error = new Error('load error');
      const collectionIdHash = hash({});
      const queryHash = hash({});
      const action = {
        type: LOAD_COLLECTION_FINISHED,
        resource: 'users',
        id: {},
        idHash: collectionIdHash,
        data: error,
      };
      const initialState = initialResourceState.setIn(['loading', collectionIdHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', collectionIdHash])).toBeUndefined();
      expect(newState.getIn(['collections', collectionIdHash, queryHash]).toJS())
        .toEqual({ associatedIds: [], error });
    });

    it('should handle CREATE_FINISHED action', () => {
      const action = {
        type: CREATE_FINISHED,
        resource: 'users',
        data: { id: '123' },
      };
      const initialState = initialResourceState.set('isCreating', true);
      const newState = resourceReducer(initialState, action);
      expect(newState.get('isCreating')).toBe(false);
      expect(newState.getIn(['items', '123']).toJS()).toEqual({ id: '123' });
    });

    it('should handle UPDATE_FINISHED action', () => {
      const promise = Promise.resolve();
      const action = {
        type: UPDATE_FINISHED,
        idHash,
        data: { id: '123' },
      };
      const initialState = initialResourceState.setIn(['updating', idHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['updating', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash]).toJS()).toEqual({ id: '123' });
    });

    it('should handle DESTROY_FINISHED action', () => {
      const promise = Promise.resolve();
      const action = {
        type: DESTROY_FINISHED,
        idHash,
      };
      const initialState = initialResourceState.setIn(['destroying', idHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['destroying', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash])).toBeUndefined();
    });

    it('should return previous state for irrelevant actions', () => {
      const state = 'state';
      const action = { type: 'IRRELEVANT_ACTION' };
      expect(resourceReducer(state, action)).toEqual(state);
    });
  });

  describe('resourcesReducer', () => {
    it('should reset to initial state for RESET action', () => {
      const state = 'state';
      const action = { type: RESET };
      const reducer = resourcesReducer;
      expect(reducer(state, action)).toEqual(iMap());
    });

    it('should update a resources state on a resource action', () => {
      const state = iMap();
      const action = {
        type: CREATE_STARTED,
        resource: 'users',
      };
      const reducer = resourcesReducer;
      const newState = reducer(state, action);
      expect(newState.getIn(['users', 'isCreating'])).toBe(true);
    });

    it('should return the previous state for irrelevant actions', () => {
      const state = 'state';
      const action = { type: 'IRRELEVANT_ACTION' };
      const reducer = resourcesReducer;
      expect(reducer(state, action)).toEqual(state);
    });

    it('should set up the correct initial state', () => {
      const reducer = resourcesReducer;
      const action = { type: '@@redux/INIT' };
      expect(reducer(undefined, action)).toEqual(iMap());
    });
  });
});
