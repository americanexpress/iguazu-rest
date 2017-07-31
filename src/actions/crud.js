import {
  resourceIsLoaded,
  getResource,
  resourceIsLoading,
  getResourceLoadPromise,
  collectionIsLoaded,
  getCollection,
  collectionIsLoading,
  getCollectionLoadPromise,
} from '../selectors';
import executeFetch from './executeFetch';

export function loadResource({ resource, id, opts, forceFetch }) {
  return (dispatch, getState) => {
    const state = getState();
    let promise;
    if (resourceIsLoaded({ state, resource, id }) && !forceFetch) {
      const data = getResource({ state: getState(), resource, id });
      promise = data instanceof Error ? Promise.reject(data) : Promise.resolve(data);
    } else if (resourceIsLoading({ state, resource, id }) && !forceFetch) {
      promise = getResourceLoadPromise({ state, resource, id });
    } else {
      promise = dispatch(executeFetch({ resource, id, opts, actionType: 'LOAD' }));
    }

    return promise;
  };
}

export function loadCollection({ resource, id, opts, forceFetch }) {
  return (dispatch, getState) => {
    const state = getState();
    let promise;
    if (collectionIsLoaded({ state, resource, id, opts }) && !forceFetch) {
      const data = getCollection({ state, resource, id, opts });
      promise = data instanceof Error ? Promise.reject(data) : Promise.resolve(data);
    } else if (collectionIsLoading({ state, resource, id, opts }) && !forceFetch) {
      promise = getCollectionLoadPromise({ state, resource, id, opts });
    } else {
      promise = dispatch(executeFetch({ resource, id, opts, actionType: 'LOAD_COLLECTION' }));
    }

    return promise;
  };
}

export function createResource({ resource, id, opts }) {
  return dispatch => dispatch(executeFetch({ resource, id, opts, actionType: 'CREATE' }));
}

export function updateResource({ resource, id, opts }) {
  return dispatch => dispatch(executeFetch({ resource, id, opts, actionType: 'UPDATE' }));
}

export function destroyResource({ resource, id, opts }) {
  return dispatch => dispatch(executeFetch({ resource, id, opts, actionType: 'DESTROY' }));
}
