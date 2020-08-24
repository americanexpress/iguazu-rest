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

import { Map as iMap, List as iList, fromJS } from 'immutable';

import config from './config';
import * as iguazuRestTypes from './types';
import {
  getResourceIdHash,
  getCollectionIdHash,
  getQueryHash,
} from './helpers/hash';
import { ARRAY_RESPONSE_ERROR } from './errors';

const {
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
  UPDATE_COLLECTION_FINISHED,
  UPDATE_COLLECTION_ERROR,
  UPDATE_ERROR,
  DESTROY_FINISHED,
  DESTROY_ERROR,
  CLEAR_RESOURCE,
  CLEAR_COLLECTION,
  RESET,
  PATCH_FINISHED,
  PATCH_ERROR,
} = iguazuRestTypes;
const iguazuRestTypesArray = Object.keys(iguazuRestTypes).map((key) => iguazuRestTypes[key]);

function getIdKey(resource) {
  return config.resources[resource].idKey || 'id';
}


export const initialResourceState = iMap({
  items: iMap(),
  collections: iMap(),
  loading: iMap(),
  isCreating: false,
  updating: iMap(),
  destroying: iMap(),
});

// eslint-disable-next-line complexity
export function resourceReducer(state, action) {
  switch (action.type) {
    case LOAD_STARTED: {
      const { id, promise } = action;
      const idHash = getResourceIdHash(id);
      return state.update('loading', (map) => map.set(idHash, promise));
    }

    case LOAD_COLLECTION_STARTED: {
      const { id, opts, promise } = action;
      const collectionIdHash = getCollectionIdHash(id);
      const queryHash = getQueryHash(opts);
      return state.update('loading', (map) => map.setIn([collectionIdHash, queryHash], promise));
    }

    case CREATE_STARTED: {
      return state.set('isCreating', true);
    }

    case UPDATE_STARTED: {
      const { id, promise } = action;
      const idHash = getResourceIdHash(id);
      return state.update('updating', (map) => map.set(idHash, promise));
    }

    case UPDATE_COLLECTION_STARTED: {
      const { id, opts, promise } = action;
      const collectionIdHash = getCollectionIdHash(id);
      const queryHash = getQueryHash(opts);
      return state.update('updating', (map) => map.setIn([collectionIdHash, queryHash], promise));
    }

    case DESTROY_STARTED: {
      const { id, promise } = action;
      const idHash = getResourceIdHash(id);
      return state.update('destroying', (map) => map.set(idHash, promise));
    }

    case PATCH_STARTED: {
      const { id, promise } = action;
      const idHash = getResourceIdHash(id);
      return state.update('updating', (map) => map.set(idHash, promise));
    }

    case LOAD_FINISHED: {
      const { id, data } = action;
      const idHash = getResourceIdHash(id);
      return state.withMutations((resourceState) => (Array.isArray(data)
        ? resourceState
          .update('loading', (map) => map.delete(idHash))
          .setIn(['error', idHash], new Error(ARRAY_RESPONSE_ERROR))
        : resourceState
          .update('loading', (map) => map.delete(idHash))
          .update('items', (map) => map.set(idHash, iMap(data)))
          .deleteIn(['error', idHash]))
      );
    }

    case CLEAR_RESOURCE: {
      const { id } = action;
      const idHash = getResourceIdHash(id);
      return state.withMutations((resourceState) => {
        const withCollection = resourceState
          .get('collections', iList())
          .toIndexedSeq()
          .flatMap((eachCollection) => eachCollection.toIndexedSeq())
          .flatMap((eachRelatedQueryHash) => eachRelatedQueryHash.toIndexedSeq())
          .flatMap((eachRelatedResourceCollection) => eachRelatedResourceCollection.toIndexedSeq())
          .contains(idHash);

        if (withCollection) {
          return resourceState;
        }

        return resourceState
          .update('loading', (map) => map.delete(idHash))
          .update('items', (map) => map.delete(idHash))
          .deleteIn(['error', idHash]);
      }
      );
    }

    case LOAD_ERROR: {
      const { id, data } = action;
      const idHash = getResourceIdHash(id);
      return state.withMutations((resourceState) => resourceState
        .update('loading', (map) => map.delete(idHash))
        .setIn(['error', idHash], data)
      );
    }

    case LOAD_COLLECTION_FINISHED: {
      const {
        id, resource: resourceType, data, opts,
      } = action;
      const collectionIdHash = getCollectionIdHash(id);
      const queryHash = getQueryHash(opts);
      const idKey = getIdKey(resourceType);
      const resourceMap = Array.isArray(data)
        ? data.reduce((map, resource) => {
          const resourceIdHash = getResourceIdHash(resource[idKey]);
          return Object.assign(map, { [resourceIdHash]: resource });
        }, {}) : {};
      const associatedIds = Object.keys(resourceMap);
      return state.withMutations((resourceState) => resourceState
        .deleteIn(['loading', collectionIdHash, queryHash])
        .update('loading', (loading) => (loading.get(collectionIdHash, iMap()).isEmpty() ? loading.delete(collectionIdHash) : loading))
        .mergeIn(['items'], fromJS(resourceMap))
        .setIn(
          ['collections', collectionIdHash, queryHash],
          iMap({ associatedIds: iList(associatedIds) })
        )
      );
    }

    case UPDATE_COLLECTION_FINISHED: {
      const {
        id, resource: resourceType, data, opts,
      } = action;
      const collectionIdHash = getCollectionIdHash(id);
      const queryHash = getQueryHash(opts);
      const idKey = getIdKey(resourceType);
      const resourceMap = Array.isArray(data)
        ? data.reduce((map, resource) => {
          const resourceIdHash = getResourceIdHash(resource[idKey]);
          return Object.assign(map, { [resourceIdHash]: resource });
        }, {}) : {};
      const associatedIds = Object.keys(resourceMap);
      return state.withMutations((resourceState) => resourceState
        .deleteIn(['updating', collectionIdHash, queryHash])
        .update('updating', (updating) => (updating.get(collectionIdHash, iMap()).isEmpty() ? updating.delete(collectionIdHash) : updating))
        .mergeIn(['items'], fromJS(resourceMap))
        .setIn(
          ['collections', collectionIdHash, queryHash],
          iMap({ associatedIds: iList(associatedIds) })
        )
      );
    }

    case CLEAR_COLLECTION: {
      const { id, opts } = action;
      const collectionIdHash = getCollectionIdHash(id);
      const queryHash = getQueryHash(opts);
      return state.withMutations((resourceState) => {
        const collections = resourceState.get('collections', iMap());
        const myCollection = collections.getIn([collectionIdHash, queryHash, 'associatedIds'], iList());
        const combinedIds = collections.removeIn([collectionIdHash, queryHash])
          .toIndexedSeq()
          .flatMap((eachCollection) => eachCollection.toIndexedSeq())
          .flatMap((eachRelatedQueryHash) => eachRelatedQueryHash.toIndexedSeq())
          .flatMap((eachRelatedResourceCollection) => eachRelatedResourceCollection.toIndexedSeq());

        const toDelete = myCollection
          .filterNot((associatedId) => combinedIds.contains(associatedId));

        return (
          toDelete
            .reduce((newState, associatedId) => newState.deleteIn(['items', associatedId]), resourceState)
            .deleteIn(['error', collectionIdHash, queryHash])
            .deleteIn(['loading', collectionIdHash, queryHash])
            .deleteIn(['collections', collectionIdHash, queryHash])
        );
      });
    }

    case LOAD_COLLECTION_ERROR: {
      const { id, data, opts } = action;
      const collectionIdHash = getCollectionIdHash(id);
      const queryHash = getQueryHash(opts);
      return state.withMutations((resourceState) => resourceState
        .deleteIn(['loading', collectionIdHash, queryHash])
        .update('loading', (map) => (map.get(collectionIdHash, iMap()).isEmpty() ? map.delete(collectionIdHash) : map))
        .setIn(['collections', collectionIdHash, queryHash, 'error'], data)
      );
    }

    case UPDATE_COLLECTION_ERROR: {
      const { id, data, opts } = action;
      const collectionIdHash = getCollectionIdHash(id);
      const queryHash = getQueryHash(opts);
      return state.withMutations((resourceState) => resourceState
        .deleteIn(['updating', collectionIdHash, queryHash])
        .update('updating', (map) => (map.get(collectionIdHash, iMap()).isEmpty() ? map.delete(collectionIdHash) : map))
        .setIn(['collections', collectionIdHash, queryHash, 'error'], data)
      );
    }

    case CREATE_FINISHED: {
      const { resource, data } = action;
      const idKey = getIdKey(resource);
      return state.withMutations((resourceState) => resourceState
        .set('isCreating', false)
        .update('items', (map) => map.set(getResourceIdHash(data[idKey]), fromJS(data)))
        .update('collections', (map) => map.clear())
      );
    }

    case CREATE_ERROR: {
      return state.withMutations((resourceState) => resourceState
        .set('isCreating', false)
      );
    }

    case UPDATE_FINISHED: {
      const { id, data } = action;
      const idHash = getResourceIdHash(id);
      return state.withMutations((resourceState) => resourceState
        .update('updating', (map) => map.delete(idHash))
        .update('items', (map) => map.set(idHash, fromJS(data)))
      );
    }

    case UPDATE_ERROR: {
      const { id } = action;
      const idHash = getResourceIdHash(id);
      return state.withMutations((resourceState) => resourceState
        .update('updating', (map) => map.delete(idHash))
      );
    }

    case DESTROY_FINISHED: {
      const { id } = action;
      const idHash = getResourceIdHash(id);
      return state.withMutations((resourceState) => resourceState
        .update('destroying', (map) => map.delete(idHash))
        .update('items', (map) => map.delete(idHash))
        .update('collections', (idMap) => idMap.map((queryMap) => queryMap.map((m) => m.update('associatedIds', (ids) => (ids.indexOf(idHash) !== -1 ? ids.delete(ids.indexOf(idHash)) : ids)
        ))))
      );
    }

    case DESTROY_ERROR: {
      const { id } = action;
      const idHash = getResourceIdHash(id);
      return state.withMutations((resourceState) => resourceState
        .update('destroying', (map) => map.delete(idHash))
      );
    }

    case PATCH_FINISHED: {
      const { id, data } = action;
      const idHash = getResourceIdHash(id);
      return state.withMutations((resourceState) => resourceState
        .update('updating', (map) => map.delete(idHash))
        .update('items', (map) => map.set(idHash, fromJS(data)))
      );
    }

    case PATCH_ERROR: {
      const { id } = action;
      const idHash = getResourceIdHash(id);
      return state.withMutations((resourceState) => resourceState
        .update('updating', (map) => map.delete(idHash))
      );
    }

    default:
      return state;
  }
}

export default function rootReducer(state = iMap(), action) {
  if (action.type === RESET) {
    return iMap();
  } if (iguazuRestTypesArray.includes(action.type)) {
    return state.update(
      action.resource,
      initialResourceState,
      (resourceState) => resourceReducer(resourceState, action)
    );
  }

  return state;
}
