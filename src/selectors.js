import { Map as iMap } from 'immutable';

import { getToState } from './config';
import { getIdHash, getQueryHash } from './helpers/hash';

export function resourceIsLoaded({ resource, id }) {
  return state => !!getToState(state).getIn([resource, 'items', getIdHash(id)]);
}

export function getResource({ resource, id }) {
  return (state) => {
    const item = getToState(state).getIn([resource, 'items', getIdHash(id)]);
    return item ? item.toJS() : item;
  };
}

export function resourceIsLoading({ resource, id }) {
  return state => !!getToState(state).getIn([resource, 'loading', getIdHash(id)]);
}

export function getResourceLoadPromise({ resource, id }) {
  return state => getToState(state).getIn([resource, 'loading', getIdHash(id)]);
}

export function collectionIsLoaded({ resource, id, opts }) {
  return (state) => {
    const idHash = getIdHash(id);
    const queryHash = getQueryHash(opts);
    return !!getToState(state).getIn([resource, 'collections', idHash, queryHash]);
  };
}

export function getCollection({ resource, id, opts }) {
  return (state) => {
    const resourceState = getToState(state).get(resource);
    const idHash = getIdHash(id);
    const queryHash = getQueryHash(opts);
    const { associatedIds, error } =
      resourceState.getIn(['collections', idHash, queryHash], iMap({ associatedIds: [] })).toJS();

    if (error) return error;

    return associatedIds.map(resourceId => resourceState.getIn(['items', resourceId]).toJS());
  };
}

export function collectionIsLoading({ resource, id, opts }) {
  return state => !!getToState(state).getIn([resource, 'loading', getIdHash(id), getQueryHash(opts)]);
}

export function getCollectionLoadPromise({ resource, id, opts }) {
  return state => getToState(state).getIn([resource, 'loading', getIdHash(id), getQueryHash(opts)]);
}
