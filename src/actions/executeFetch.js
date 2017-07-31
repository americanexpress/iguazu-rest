import merge from 'deepmerge';

import * as types from '../types';
import { buildFetchUrl } from '../helpers/url';
import config from '../config';

function startsWith(string, target) {
  return String(string).slice(0, target.length) === target;
}

async function extractDataFromResponse(res) {
  const contentType = res.headers.get('Content-Type');
  const isJson = startsWith(contentType, 'application/json');
  const body = await res[isJson ? 'json' : 'text']();
  const { status } = res;

  return res.ok ?
    body :
    Object.assign(new Error(`${res.statusText} (${res.url})`), { body, status });
}

const actionTypeMethodMap = {
  LOAD: 'GET',
  LOAD_COLLECTION: 'GET',
  CREATE: 'POST',
  UPDATE: 'PUT',
  DESTROY: 'DELETE',
};

function getFetchPromise({ resource, id, opts, actionType, state }) {
  const { resources, defaultOpts, baseFetch } = config;
  const { url, opts: resourceOpts } = resources[resource].fetch(id, actionType, state);

  const fetchOpts = merge.all([
    { method: actionTypeMethodMap[actionType] },
    defaultOpts || {},
    resourceOpts || {},
    opts || {},
  ]);
  const fetchUrl = buildFetchUrl({ url, id, opts: fetchOpts });

  return baseFetch(fetchUrl, fetchOpts);
}

export default function executeFetch({ resource, id, opts, actionType }) {
  return async (dispatch, getState) => {
    const promise = getFetchPromise({ resource, id, opts, actionType, state: getState() });

    dispatch({ type: types[`${actionType}_STARTED`], resource, id, opts, promise });
    const res = await promise;
    const receivedAt = Date.now();
    const data = await extractDataFromResponse(res);
    dispatch({ type: types[`${actionType}_FINISHED`], resource, id, opts, data, receivedAt });

    return res.ok ? Promise.resolve(data) : Promise.reject(data);
  };
}
