import { Map as iMap, List as iList, fromJS } from 'immutable';
import hash from 'object-hash';

import config from './config';
import iguazuRestTypes from './types';
import { getQueryHash } from './helpers/hash';

const {
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
} = iguazuRestTypes;
const iguazuRestTypesArray = Object.keys(iguazuRestTypes).map(key => iguazuRestTypes[key]);

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

export function resourceReducer(state, action) {
  switch (action.type) {
    case LOAD_STARTED: {
      const { idHash, promise } = action;
      return state.update('loading', map => map.set(idHash, promise));
    }

    case LOAD_COLLECTION_STARTED: {
      const { idHash, opts, promise } = action;
      const queryHash = getQueryHash(opts);
      return state.update('loading', map => map.setIn([idHash, queryHash], promise));
    }

    case CREATE_STARTED: {
      return state.set('isCreating', true);
    }

    case UPDATE_STARTED: {
      const { idHash, promise } = action;
      return state.update('updating', map => map.set(idHash, promise));
    }

    case DESTROY_STARTED: {
      const { idHash, promise } = action;
      return state.update('destroying', map => map.set(idHash, promise));
    }

    case LOAD_FINISHED: {
      const { idHash, data } = action;
      return state.withMutations(resourceState =>
        resourceState
          .update('loading', map => map.delete(idHash))
          .update('items', map => map.set(idHash, iMap(data)))
      );
    }

    case LOAD_COLLECTION_FINISHED: {
      const { id, idHash, resource: resourceType, data, opts } = action;
      const queryHash = getQueryHash(opts);
      const idKey = getIdKey(resourceType);
      const resourceMap = data instanceof Array ?
        data.reduce((map, resource) => {
          const resourceId = resource[idKey];
          const resourceIdHash = hash(Object.assign({}, id, { id: resourceId }));
          return Object.assign(map, { [resourceIdHash]: resource });
        }, {}) : {};
      const associatedIds = Object.keys(resourceMap);
      return state.withMutations(resourceState =>
        resourceState
          .deleteIn(['loading', idHash])
          .mergeIn(['items'], fromJS(resourceMap))
          .setIn(
            ['collections', idHash, queryHash],
            iMap({
              associatedIds: iList(associatedIds),
              error: data instanceof Error ? data : undefined,
            })
          )
      );
    }

    case CREATE_FINISHED: {
      const { idHash, resource, data } = action;
      const idKey = getIdKey(resource);
      return state.withMutations(resourceState =>
        resourceState
          .set('isCreating', false)
          .update('items', map => map.set(data[idKey], fromJS(data)))
          .updateIn(['collections', idHash], iList(), list => list.push(data[idKey]))
      );
    }

    case UPDATE_FINISHED: {
      const { idHash, data } = action;
      return state.withMutations(resourceState =>
        resourceState
          .update('updating', map => map.delete(idHash))
          .update('items', map => map.set(idHash, fromJS(data)))
      );
    }

    case DESTROY_FINISHED: {
      const { idHash } = action;
      return state.withMutations(resourceState =>
        resourceState
          .update('destroying', map => map.delete(idHash))
          .update('items', map => map.delete(idHash))
      );
    }

    default:
      return state;
  }
}

export default function rootReducer(state = iMap(), action) {
  if (action.type === RESET) {
    return iMap();
  } else if (iguazuRestTypesArray.includes(action.type)) {
    return state.update(
      action.resource,
      initialResourceState,
      resourceState => resourceReducer(resourceState, action)
    );
  }

  return state;
}
