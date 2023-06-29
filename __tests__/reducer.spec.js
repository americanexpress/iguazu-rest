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

import { fromJS, Map as iMap, List as iList } from 'immutable';

import {
  getResourceIdHash,
  getCollectionIdHash,
  getQueryHash,
} from '../src/helpers/hash';
import {
  LOAD_STARTED,
  LOAD_COLLECTION_STARTED,
  CREATE_STARTED,
  UPDATE_STARTED,
  UPDATE_COLLECTION_STARTED,
  DESTROY_STARTED,
  PATCH_STARTED,
  LOAD_FINISHED,
  LOAD_ERROR,
  LOAD_COLLECTION_FINISHED,
  LOAD_COLLECTION_ERROR,
  CREATE_FINISHED,
  CREATE_ERROR,
  UPDATE_FINISHED,
  UPDATE_ERROR,
  UPDATE_COLLECTION_FINISHED,
  UPDATE_COLLECTION_ERROR,
  DESTROY_FINISHED,
  DESTROY_ERROR,
  RESET,
  CLEAR_RESOURCE,
  CLEAR_COLLECTION,
  PATCH_FINISHED,
  PATCH_ERROR,
} from '../src/types';

import resourcesReducer, {
  initialResourceState,
  resourceReducer,
} from '../src/reducer';

jest.mock('../src/config', () => ({
  resources: { users: {} },
}));

const id = { id: '123' };

describe('reducer', () => {
  describe('resourceReducer', () => {
    it('should handle LOAD_STARTED action', () => {
      const promise = Promise.resolve();
      const action = {
        type: LOAD_STARTED,
        id,
        promise,
      };
      const newState = resourceReducer(initialResourceState, action);
      expect(newState.getIn(['loading', getResourceIdHash(id)])).toEqual(promise);
    });

    it('should handle LOAD_COLLECTION_STARTED action', () => {
      const promise = Promise.resolve();
      const collectionIdHash = getCollectionIdHash();
      const queryHash = getQueryHash();
      const action = {
        type: LOAD_COLLECTION_STARTED,
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
        promise,
      };
      const newState = resourceReducer(initialResourceState, action);
      expect(newState.getIn(['updating', getResourceIdHash(id)])).toEqual(promise);
    });

    it('should handle UPDATE_COLLECTION_STARTED action', () => {
      const promise = Promise.resolve();
      const collectionIdHash = getCollectionIdHash();
      const queryHash = getQueryHash();
      const action = {
        type: UPDATE_COLLECTION_STARTED,
        promise,
      };
      const newState = resourceReducer(initialResourceState, action);
      expect(newState.getIn(['updating', collectionIdHash, queryHash])).toEqual(promise);
    });

    it('should handle DESTROY_STARTED action', () => {
      const promise = Promise.resolve();
      const action = {
        type: DESTROY_STARTED,
        id,
        promise,
      };
      const newState = resourceReducer(initialResourceState, action);
      expect(newState.getIn(['destroying', getResourceIdHash(id)])).toEqual(promise);
    });

    it('should handle PATCH_STARTED action', () => {
      const promise = Promise.resolve();
      const action = {
        type: PATCH_STARTED,
        id,
        promise,
      };
      const newState = resourceReducer(initialResourceState, action);
      expect(newState.getIn(['updating', getResourceIdHash(id)])).toEqual(promise);
    });

    it('should handle LOAD_FINISHED action', () => {
      const promise = Promise.resolve();
      const data = { id, some: 'property' };
      const idHash = getResourceIdHash(id);
      const action = {
        type: LOAD_FINISHED,
        id,
        data,
      };
      const initialState = initialResourceState.setIn(['loading', idHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash]).toJS()).toEqual(data);
    });

    it('should handle CLEAR_RESOURCE action', () => {
      const otherId = { id: 456 };
      const idHash = getResourceIdHash(id);
      const otherIdHash = getResourceIdHash(otherId);
      const collectionHash = getCollectionIdHash({});
      const queryHash = getQueryHash({ param: 'key' });

      const action = {
        type: CLEAR_RESOURCE,
        id,
      };
      const otherAction = {
        type: CLEAR_RESOURCE,
        id: otherId,
      };

      const initialState = initialResourceState
        .setIn(['items', idHash], iMap({ prop: 'value' }))
        .setIn(['items', otherIdHash], iMap({ prop: 'other value' }))
        .setIn(
          ['collections', collectionHash, queryHash],
          iMap({ associatedIds: iList([otherIdHash]) })
        );

      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash])).toBeUndefined();
      expect(newState.getIn(['error', idHash])).toBeUndefined();

      const otherState = resourceReducer(initialState, otherAction);
      expect(otherState.getIn(['loading', otherIdHash])).toBeUndefined();
      expect(otherState.getIn(['items', otherIdHash]).toJS()).toEqual({ prop: 'other value' });
      expect(otherState.getIn(['error', otherIdHash])).toBeUndefined();
    });

    it('should handle storing resource by id object', () => {
      const promise = Promise.resolve();
      const idObj = { id: '123', param1: 'a', param2: 'b' };
      const data = { id: '123', some: 'property' };
      const idObjHash = getResourceIdHash(idObj);
      const action = {
        type: LOAD_FINISHED,
        id: idObj,
        data,
      };
      const initialState = initialResourceState.setIn(['loading', idObjHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', idObjHash])).toBeUndefined();
      expect(newState.getIn(['items', idObjHash]).toJS()).toEqual(data);
    });

    it('should set in error if data of incorrect array type passed to LOAD_FINISHED', () => {
      const promise = Promise.resolve();
      const idObj = { id: '123', param1: 'a', param2: 'b' };
      const data = [{ id: '123', some: 'property' }];
      const idObjHash = getResourceIdHash(idObj);
      const action = {
        type: LOAD_FINISHED,
        id: idObj,
        data,
      };
      const initialState = initialResourceState.setIn(['loading', idObjHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', idObjHash])).toBeUndefined();
      expect(newState.getIn(['items', idObjHash])).toBeUndefined();
      expect(newState.getIn(['error', idObjHash])).toEqual(new Error('Resource call must return an object, not an array'));
    });

    it('should reset error on subsequent LOAD_FINISHED success', () => {
      const promise = Promise.resolve();
      const error = new Error('load error');
      const data = { id, some: 'property' };
      const idHash = getResourceIdHash(id);
      const action = {
        type: LOAD_FINISHED,
        id,
        data,
      };
      const initialState = initialResourceState
        .setIn(['error', idHash], error)
        .setIn(['loading', idHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', idHash])).toBeUndefined();
      expect(newState.getIn(['error', idHash])).toBeUndefined();
    });

    it('should handle LOAD_ERROR action', () => {
      const promise = Promise.resolve('completed');
      const error = new Error('load error');
      const idHash = getResourceIdHash(id);
      const action = {
        type: LOAD_ERROR,
        id,
        data: error,
      };
      const initialState = initialResourceState.setIn(['loading', idHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', idHash])).toBeUndefined();
      expect(newState.getIn(['error', idHash])).toEqual(error);
    });

    it('handles CLEAR_COLLECTION action when collection exists', () => {
      const promise = Promise.resolve();
      const otherId = { id: 456 };
      const collectionIdHash = getCollectionIdHash({});
      const resourceIdHash = getResourceIdHash(id);
      const otherResourceIdHash = getResourceIdHash(otherId);
      const action = {
        type: CLEAR_COLLECTION,
        id: 'someId',
        resource: 'users',
        opts: { query: 'value' },
      };
      const opts = { query: 'value' };
      const otherOpts = { query1: 'value1' };
      const queryHash = getQueryHash(opts);
      const otherQueryHash = getQueryHash(otherOpts);

      const initialState = initialResourceState
        .setIn(
          ['loading', collectionIdHash],
          iMap({ [queryHash]: promise })
        )
        .setIn(
          ['error', collectionIdHash],
          iMap({ [queryHash]: 'some error' })
        )
        .setIn(
          ['items', resourceIdHash],
          iMap({ prop: 'some value' })
        )
        .setIn(
          ['items', otherResourceIdHash],
          iMap({ prop: 'some other value' })
        )
        .setIn(
          ['collections', collectionIdHash, queryHash],
          iMap({ associatedIds: iList([resourceIdHash, otherResourceIdHash]) })
        )
        .setIn(
          ['collections', collectionIdHash, otherQueryHash],
          iMap({ associatedIds: iList([otherResourceIdHash]) })
        );

      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', collectionIdHash, queryHash])).toBeUndefined();
      expect(newState.getIn(['error', collectionIdHash, queryHash])).toBeUndefined();
      expect(newState.getIn(['items']).size).toEqual(1);
      expect(newState.getIn(['items', otherResourceIdHash]).toJS()).toEqual({ prop: 'some other value' });
      expect(newState.getIn(['collections', collectionIdHash, queryHash])).toBeUndefined();
      expect(newState.getIn(['collections', collectionIdHash, otherQueryHash])).toBeDefined();
      expect(newState.getIn(['collections', collectionIdHash, otherQueryHash, 'associatedIds']).toJS())
        .toEqual([otherResourceIdHash]);
    });

    it('CLEAR_COLLECTION does not crash if collection does not exist', () => {
      const collectionIdHash = getCollectionIdHash({});
      const resourceIdHash = getResourceIdHash(id);
      const action = {
        type: CLEAR_COLLECTION,
        resource: 'users',
        opts: { query: 'value' },
      };
      const opts = { query: 'value' };
      const queryHash = getQueryHash(opts);

      const newState = resourceReducer(initialResourceState, action);
      expect(newState.getIn(['loading', collectionIdHash, queryHash])).toBeUndefined();
      expect(newState.getIn(['error', collectionIdHash, queryHash])).toBeUndefined();
      expect(newState.getIn(['items', resourceIdHash])).toBeUndefined();
      expect(newState.getIn(['collections', collectionIdHash, queryHash])).toBeUndefined();
    });

    it('should handle LOAD_COLLECTION_FINISHED action with a successful response', () => {
      const promise = Promise.resolve();
      const collectionIdHash = getCollectionIdHash({});
      const queryHash = getQueryHash();
      const resourceIdHash = getResourceIdHash(id);
      const action = {
        type: LOAD_COLLECTION_FINISHED,
        resource: 'users',
        idHash: collectionIdHash,
        data: [{ id: '123' }],
      };
      const opts = { query: 'value' };
      const differentQueryHash = getQueryHash(opts);
      const initialState = initialResourceState.setIn(
        ['loading', collectionIdHash],
        iMap({ [queryHash]: promise, [differentQueryHash]: promise })
      );
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', collectionIdHash, queryHash])).toBeUndefined();
      expect(newState.getIn(['loading', collectionIdHash, differentQueryHash])).toBeDefined();
      expect(newState.getIn(['items', resourceIdHash]).toJS()).toEqual({ id: '123' });
      expect(newState.getIn(['collections', collectionIdHash, queryHash]).toJS())
        .toEqual({ associatedIds: [resourceIdHash] });

      const updatedState = resourceReducer(newState, {
        type: LOAD_COLLECTION_FINISHED,
        resource: 'users',
        idHash: collectionIdHash,
        opts,
        data: '',
      });
      expect(updatedState.getIn(['loading', collectionIdHash, differentQueryHash])).toBeUndefined();
    });

    it('should reset error on subsequent LOAD_COLLECTION_FINISHED success', () => {
      const promise = Promise.resolve();
      const error = new Error('load error');
      const collectionIdHash = getCollectionIdHash({});
      const queryHash = getQueryHash();
      const action = {
        type: LOAD_COLLECTION_FINISHED,
        resource: 'users',
        idHash: collectionIdHash,
        data: [{ id: '123' }],
      };
      const initialState = initialResourceState
        .setIn(['collections', collectionIdHash, queryHash, 'error'], error)
        .setIn(['loading', collectionIdHash], iMap({ [queryHash]: promise }));

      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', collectionIdHash, queryHash])).toBeUndefined();
      expect(newState.getIn(['collections', collectionIdHash, queryHash, 'error'])).toBeUndefined();
    });

    it('should handle LOAD_COLLECTION_ERROR action', () => {
      const promise = Promise.resolve();
      const error = new Error('load error');
      const collectionIdHash = getCollectionIdHash({});
      const queryHash = getQueryHash();
      const action = {
        type: LOAD_COLLECTION_ERROR,
        resource: 'users',
        idHash: collectionIdHash,
        data: error,
      };
      const opts = { query: 'value' };
      const differentQueryHash = getQueryHash(opts);
      const initialState = initialResourceState.setIn(
        ['loading', collectionIdHash],
        iMap({ [queryHash]: promise, [differentQueryHash]: promise })
      );
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['loading', collectionIdHash, queryHash])).toBeUndefined();
      expect(newState.getIn(['loading', collectionIdHash, differentQueryHash])).toBeDefined();
      expect(newState.getIn(['collections', collectionIdHash, queryHash, 'error'])).toEqual(error);

      const updatedState = resourceReducer(newState, {
        type: LOAD_COLLECTION_ERROR,
        resource: 'users',
        idHash: collectionIdHash,
        opts,
        data: error,
      });
      expect(updatedState.getIn(['loading', collectionIdHash, differentQueryHash])).toBeUndefined();
      expect(updatedState.getIn(['collections', collectionIdHash, differentQueryHash, 'error']))
        .toEqual(error);
    });

    it('should handle CREATE_FINISHED action', () => {
      const action = {
        type: CREATE_FINISHED,
        resource: 'users',
        data: { id: '123' },
      };
      const initialState = initialResourceState
        .set('isCreating', true)
        .set('collections', iMap({ idHash: { queryHash: { associatedIds: ['a', 'b'] } } }));
      const newState = resourceReducer(initialState, action);
      expect(newState.get('isCreating')).toBe(false);
      expect(newState.getIn(['items', getResourceIdHash(id)]).toJS()).toEqual({ id: '123' });
      expect(newState.get('collections')).toEqual(iMap());
    });

    it('should handle CREATE_ERROR action', () => {
      const error = new Error('load error');
      const action = {
        type: CREATE_ERROR,
        resource: 'users',
        data: error,
      };
      const initialCollection = iMap({ idHash: { queryHash: { associatedIds: ['a', 'b'] } } });
      const initialState = initialResourceState
        .set('isCreating', true)
        .set('collections', initialCollection);
      const newState = resourceReducer(initialState, action);
      expect(newState.get('isCreating')).toBe(false);
      expect(newState.getIn(['items', getResourceIdHash(id)])).toBeUndefined();
      expect(newState.get('collections')).toEqual(initialCollection);
    });

    it('should handle UPDATE_FINISHED action', () => {
      const promise = Promise.resolve();
      const idHash = getResourceIdHash(id);
      const action = {
        type: UPDATE_FINISHED,
        id,
        data: { id: '123' },
      };
      const initialState = initialResourceState.setIn(['updating', idHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['updating', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash]).toJS()).toEqual({ id: '123' });
    });

    it('should handle UPDATE_ERROR action', () => {
      const promise = Promise.resolve();
      const error = new Error('load error');
      const idHash = getResourceIdHash(id);
      const action = {
        type: UPDATE_ERROR,
        id,
        data: error,
      };
      const initialState = initialResourceState.setIn(['updating', idHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['updating', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash])).toBeUndefined();
    });

    it('should handle UPDATE_COLLECTION_FINISHED action with a successful response', () => {
      const promise = Promise.resolve();
      const collectionIdHash = getCollectionIdHash({});
      const queryHash = getQueryHash();
      const resourceIdHash = getResourceIdHash(id);
      const action = {
        type: UPDATE_COLLECTION_FINISHED,
        resource: 'users',
        idHash: collectionIdHash,
        data: [{ id: '123' }],
      };
      const opts = { query: 'value' };
      const differentQueryHash = getQueryHash(opts);
      const initialState = initialResourceState.setIn(
        ['updating', collectionIdHash],
        iMap({ [queryHash]: promise, [differentQueryHash]: promise })
      );
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['updating', collectionIdHash, queryHash])).toBeUndefined();
      expect(newState.getIn(['updating', collectionIdHash, differentQueryHash])).toBeDefined();
      expect(newState.getIn(['items', resourceIdHash]).toJS()).toEqual({ id: '123' });

      const updatedState = resourceReducer(newState, {
        type: UPDATE_COLLECTION_FINISHED,
        resource: 'users',
        idHash: collectionIdHash,
        opts,
        data: '',
      });
      expect(updatedState.getIn(['updating', collectionIdHash, differentQueryHash])).toBeUndefined();
    });

    it('should reset error on subsequent UPDATE_COLLECTION_FINISHED success', () => {
      const promise = Promise.resolve();
      const error = new Error('load error');
      const collectionIdHash = getCollectionIdHash({});
      const queryHash = getQueryHash();
      const action = {
        type: UPDATE_COLLECTION_FINISHED,
        resource: 'users',
        idHash: collectionIdHash,
        data: [{ id: '123' }],
      };
      const initialState = initialResourceState
        .setIn(['collections', collectionIdHash, queryHash, 'error'], error)
        .setIn(['updating', collectionIdHash], iMap({ [queryHash]: promise }));

      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['updating', collectionIdHash, queryHash])).toBeUndefined();
    });

    it('should handle UPDATE_COLLECTION_ERROR action', () => {
      const promise = Promise.resolve();
      const error = new Error('update error');
      const collectionIdHash = getCollectionIdHash({});
      const queryHash = getQueryHash();
      const action = {
        type: UPDATE_COLLECTION_ERROR,
        resource: 'users',
        idHash: collectionIdHash,
        data: error,
      };
      const opts = { query: 'value' };
      const differentQueryHash = getQueryHash(opts);
      const initialState = initialResourceState.setIn(
        ['updating', collectionIdHash],
        iMap({ [queryHash]: promise, [differentQueryHash]: promise })
      );
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['updating', collectionIdHash, queryHash])).toBeUndefined();
      expect(newState.getIn(['updating', collectionIdHash, differentQueryHash])).toBeDefined();

      const updatedState = resourceReducer(newState, {
        type: UPDATE_COLLECTION_ERROR,
        resource: 'users',
        idHash: collectionIdHash,
        opts,
        data: error,
      });
      expect(updatedState.getIn(['updating', collectionIdHash, differentQueryHash])).toBeUndefined();
    });

    it('should handle DESTROY_FINISHED action', () => {
      const promise = Promise.resolve();
      const idHash = getResourceIdHash(id);
      const action = {
        type: DESTROY_FINISHED,
        id,
      };
      const initialState = initialResourceState
        .setIn(['destroying', idHash], promise)
        .set('collections', fromJS({ idHash: { queryHash: { associatedIds: [idHash] } } }));
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['destroying', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash])).toBeUndefined();
      expect(newState.getIn(['collections', 'idHash', 'queryHash', 'associatedIds']).includes(idHash)).toBe(false);
    });

    it('shouldnt destroy unrelated resources', () => {
      const promise = Promise.resolve();
      const deleteId = { id: '123' };
      const idHash = getResourceIdHash(deleteId);

      const associatedId = { id: '456' };
      const associatedIdHash = getResourceIdHash(associatedId);

      const action = {
        type: DESTROY_FINISHED,
        id: deleteId,
      };
      const initialState = initialResourceState
        .setIn(['destroying', idHash], promise)
        .set('collections', fromJS({
          idHash: {
            queryHash: { associatedIds: [idHash] },
            relatedQueryHash: { associatedIds: [associatedIdHash] },
          },
        }));
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['destroying', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash])).toBeUndefined();
      expect(newState.getIn(['collections', 'idHash', 'queryHash', 'associatedIds']).includes(idHash)).toBe(false);
      expect(newState.getIn(['collections', 'idHash', 'relatedQueryHash', 'associatedIds']).includes(associatedIdHash)).toBe(true);
    });

    it('should handle DESTROY_ERROR action', () => {
      const promise = Promise.resolve();
      const error = new Error('load error');
      const idHash = getResourceIdHash(id);
      const action = {
        type: DESTROY_ERROR,
        id,
        data: error,
      };
      const initialItems = { [idHash]: id };
      const initialCollection = fromJS({ idHash: { queryHash: { associatedIds: [idHash] } } });
      const initialState = initialResourceState
        .setIn(['destroying', idHash], promise)
        .set('items', initialItems)
        .set('collections', initialCollection);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['destroying', idHash])).toBeUndefined();
      expect(newState.get('items')).toEqual(initialItems);
      expect(newState.get('collections')).toEqual(initialCollection);
    });

    it('should return previous state for irrelevant actions', () => {
      const state = 'state';
      const action = { type: 'IRRELEVANT_ACTION' };
      expect(resourceReducer(state, action)).toEqual(state);
    });

    it('should handle PATCH_FINISHED action', () => {
      const promise = Promise.resolve();
      const idHash = getResourceIdHash(id);
      const action = {
        type: PATCH_FINISHED,
        id,
        data: { id: '123' },
      };
      const initialState = initialResourceState.setIn(['updating', idHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['updating', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash]).toJS()).toEqual({ id: '123' });
    });

    it('should handle PATCH_ERROR action', () => {
      const promise = Promise.resolve();
      const error = new Error('load error');
      const idHash = getResourceIdHash(id);
      const action = {
        type: PATCH_ERROR,
        id,
        data: error,
      };
      const initialState = initialResourceState.setIn(['updating', idHash], promise);
      const newState = resourceReducer(initialState, action);
      expect(newState.getIn(['updating', idHash])).toBeUndefined();
      expect(newState.getIn(['items', idHash])).toBeUndefined();
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

  describe('flows', () => {
    it('clears the collection loading state after all queries are finished', () => {
      let state = resourcesReducer(undefined, { type: '@@init' });
      const optsA = { query: { a: 1 } };
      const optsB = { query: { b: 2 } };
      const optsC = { query: { c: 3 } };
      // start A, B, C
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsA, promise: Promise.resolve(),
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsB, promise: Promise.resolve(),
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsC, promise: Promise.resolve(),
      });
      // finish A, C, B to ensure order doesn't matter
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_FINISHED, resource: 'users', id, data: [], opts: optsA,
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_FINISHED, resource: 'users', id, data: [], opts: optsC,
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_FINISHED, resource: 'users', id, data: [], opts: optsB,
      });
      expect(state.getIn(['users', 'loading'])).toEqual(iMap());
    });

    it('does not die on race conditions of successful loads', () => {
      let state = resourcesReducer(undefined, { type: '@@init' });
      const optsA = { query: { a: 1 } };
      const optsB = { query: { b: 2 } };
      // start A, B, A, B
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsA, promise: Promise.resolve(),
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsB, promise: Promise.resolve(),
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsA, promise: Promise.resolve(),
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsB, promise: Promise.resolve(),
      });
      // finish B, B, A, A to ensure order doesn't matter
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_FINISHED, resource: 'users', id, data: [], opts: optsB,
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_FINISHED, resource: 'users', id, data: [], opts: optsB,
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_FINISHED, resource: 'users', id, data: [], opts: optsA,
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_FINISHED, resource: 'users', id, data: [], opts: optsA,
      });
      expect(state.getIn(['users', 'loading'])).toEqual(iMap());
    });

    it('does not die on race conditions of unsuccessful loads', () => {
      let state = resourcesReducer(undefined, { type: '@@init' });
      const optsA = { query: { a: 1 } };
      const optsB = { query: { b: 2 } };
      // start A, B, A, B
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsA, promise: Promise.resolve(),
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsB, promise: Promise.resolve(),
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsA, promise: Promise.resolve(),
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_STARTED, resource: 'users', id, opts: optsB, promise: Promise.resolve(),
      });
      // finish B, B, A, A to ensure order doesn't matter
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_ERROR, resource: 'users', id, data: new Error('oh no'), opts: optsB,
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_ERROR, resource: 'users', id, data: new Error('oh no'), opts: optsB,
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_ERROR, resource: 'users', id, data: new Error('oh no'), opts: optsA,
      });
      state = resourcesReducer(state, {
        type: LOAD_COLLECTION_ERROR, resource: 'users', id, data: new Error('oh no'), opts: optsA,
      });
      expect(state.getIn(['users', 'loading'])).toEqual(iMap());
    });
  });
});
