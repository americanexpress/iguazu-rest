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
    const data = getResource({ resource, id, opts })(state);
    const status = resourceIsLoaded({ resource, id, opts })(state) && !forceFetch ? 'complete' : 'loading';
    const promise = dispatch(loadResource({ resource, id, opts, forceFetch }));

    return { data, status, promise };
  };
}

export function queryCollection({ resource, id, opts, forceFetch }) {
  return (dispatch, getState) => {
    const state = getState();
    const data = getCollection({ resource, id, opts })(state);
    const status = collectionIsLoaded({ resource, id, opts })(state) && !forceFetch ? 'complete' : 'loading';
    const promise = dispatch(loadCollection({ resource, id, opts, forceFetch }));

    return { data, status, promise };
  };
}
