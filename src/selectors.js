import { Map as iMap } from 'immutable';

import { getToState } from './config';
import { getIdHash, getQueryHash } from './helpers/hash';

export function resourceIsLoaded({ state, resource, id }) {
  return !!getToState(state).getIn([resource, 'items', getIdHash(id)]);
}

export function getResource({ state, resource, id }) {
  const item = getToState(state).getIn([resource, 'items', getIdHash(id)]);
  return item ? item.toJS() : item;
}

export function resourceIsLoading({ state, resource, id }) {
  return !!getToState(state).getIn([resource, 'loading', getIdHash(id)]);
}

export function getResourceLoadPromise({ state, resource, id }) {
  return getToState(state).getIn([resource, 'loading', getIdHash(id)]);
}

export function collectionIsLoaded({ state, resource, id, opts }) {
  const idHash = getIdHash(id);
  const queryHash = getQueryHash(opts);
  return !!getToState(state).getIn([resource, 'collections', idHash, queryHash]);
}

export function getCollection({ state, resource, id, opts }) {
  const resourceState = getToState(state).get(resource);
  const idHash = getIdHash(id);
  const queryHash = getQueryHash(opts);
  const { associatedIds, error } =
    resourceState.getIn(['collections', idHash, queryHash], iMap({ associatedIds: [] })).toJS();

  if (error) return error;

  return associatedIds.map(resourceId => resourceState.getIn(['items', resourceId]).toJS());
}

export function collectionIsLoading({ state, resource, id, opts }) {
  return !!getToState(state).getIn([resource, 'loading', getIdHash(id), getQueryHash(opts)]);
}

export function getCollectionLoadPromise({ state, resource, id, opts }) {
  return getToState(state).getIn([resource, 'loading', getIdHash(id), getQueryHash(opts)]);
}
