import {
  getResource,
  getCollection,
  resourceIsLoaded,
  collectionIsLoaded,
} from '../selectors';
import {
  loadResource,
  loadCollection,
} from './crud';

export function queryResource({ resource, id, opts, forceFetch }) {
  return (dispatch, getState) => {
    const state = getState();
    const data = getResource({ state, resource, id, opts });
    const status = resourceIsLoaded({ state, resource, id, opts }) && !forceFetch ? 'complete' : 'loading';
    const promise = dispatch(loadResource({ resource, id, opts, forceFetch }));

    return { data, status, promise };
  };
}

export function queryCollection({ resource, id, opts, forceFetch }) {
  return (dispatch, getState) => {
    const state = getState();
    const data = getCollection({ state, resource, id, opts });
    const status = collectionIsLoaded({ state, resource, id, opts }) && !forceFetch ? 'complete' : 'loading';
    const promise = dispatch(loadCollection({ resource, id, opts, forceFetch }));

    return { data, status, promise };
  };
}
