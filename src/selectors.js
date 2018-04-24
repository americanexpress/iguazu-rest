import { Map as iMap } from 'immutable';

import config from './config';
import {
  getResourceIdHash,
  getCollectionIdHash,
  getQueryHash,
} from './helpers/hash';

export function resourceIsLoaded({ resource, id }) {
  return state => !!config.getToState(state).getIn([resource, 'items', getResourceIdHash(id)]);
}

export function getResource({ resource, id }) {
  return (state) => {
    const item = config.getToState(state).getIn([resource, 'items', getResourceIdHash(id)]);
    return iMap.isMap(item) ? item.toJS() : item;
  };
}

export function resourceIsLoading({ resource, id }) {
  return state => !!config.getToState(state).getIn([resource, 'loading', getResourceIdHash(id)]);
}

export function getResourceLoadPromise({ resource, id }) {
  return state => config.getToState(state).getIn([resource, 'loading', getResourceIdHash(id)]);
}

export function collectionIsLoaded({ resource, id, opts }) {
  return (state) => {
    const idHash = getCollectionIdHash(id);
    const queryHash = getQueryHash(opts);
    return !!config.getToState(state).getIn([resource, 'collections', idHash, queryHash]);
  };
}

export function getCollection({ resource, id, opts }) {
  return (state) => {
    const resourceState = config.getToState(state).get(resource, iMap());
    const idHash = getCollectionIdHash(id);
    const queryHash = getQueryHash(opts);
    const { associatedIds, error } =
      resourceState.getIn(['collections', idHash, queryHash], iMap({ associatedIds: [] })).toJS();

    if (error) return error;

    return associatedIds.map((resourceId) => {
      const item = resourceState.getIn(['items', resourceId]);
      return iMap.isMap(item) ? item.toJS() : item;
    });
  };
}

export function collectionIsLoading({ resource, id, opts }) {
  return state => !!config.getToState(state).getIn([resource, 'loading', getCollectionIdHash(id), getQueryHash(opts)]);
}

export function getCollectionLoadPromise({ resource, id, opts }) {
  return state => config.getToState(state).getIn([resource, 'loading', getCollectionIdHash(id), getQueryHash(opts)]);
}
