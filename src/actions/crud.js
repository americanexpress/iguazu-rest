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
    if (resourceIsLoaded({ resource, id })(state) && !forceFetch) {
      const data = getResource({ resource, id })(state);
      promise = data instanceof Error ? Promise.reject(data) : Promise.resolve(data);
    } else if (resourceIsLoading({ resource, id })(state) && !forceFetch) {
      promise = getResourceLoadPromise({ resource, id })(state);
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
    if (collectionIsLoaded({ resource, id, opts })(state) && !forceFetch) {
      const data = getCollection({ resource, id, opts })(state);
      promise = data instanceof Error ? Promise.reject(data) : Promise.resolve(data);
    } else if (collectionIsLoading({ resource, id, opts })(state) && !forceFetch) {
      promise = getCollectionLoadPromise({ resource, id, opts })(state);
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
