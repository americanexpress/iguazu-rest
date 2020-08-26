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

import merge from 'deepmerge';

import * as types from '../types';
import { buildFetchUrl } from '../helpers/url';
import config from '../config';
import { waitAndDispatchFinished } from './asyncSideEffects';

function startsWith(string, target) {
  return String(string).slice(0, target.length) === target;
}

async function extractDataFromResponse(res) {
  const contentType = res.headers.get('Content-Type');
  const isJson = startsWith(contentType, 'application/json');
  const body = await res[isJson ? 'json' : 'text']();
  const { status } = res;

  return res.ok
    ? Promise.resolve(body)
    : Promise.reject(Object.assign(new Error(`${res.statusText} (${res.url})`), { body, status }));
}

const actionTypeMethodMap = {
  LOAD: 'GET',
  LOAD_COLLECTION: 'GET',
  CREATE: 'POST',
  UPDATE: 'PUT',
  UPDATE_COLLECTION: 'POST',
  DESTROY: 'DELETE',
  PATCH: 'PATCH',
};

async function getAsyncData({
  resource, id, opts, actionType, state, fetchClient,
}) {
  const {
    resources,
    defaultOpts,
    baseFetch,
    composeFetch,
  } = config;
  const { url, opts: resourceOpts } = resources[resource].fetch(id, actionType, state);

  const fetchOpts = merge.all([
    { method: actionTypeMethodMap[actionType] },
    defaultOpts || {},
    resourceOpts || {},
    opts || {},
  ]);
  const fetchUrl = buildFetchUrl({ url, id, opts: fetchOpts });

  const selectedFetchClient = fetchClient || baseFetch;
  const composedFetchClient = composeFetch(selectedFetchClient);

  const res = await composedFetchClient(fetchUrl, fetchOpts);
  const rawData = await extractDataFromResponse(res);
  const { transformData } = config.resources[resource];
  const data = transformData ? transformData(rawData, { id, opts, actionType }) : rawData;

  return data;
}

export default function executeFetch({
  resource, id, opts, actionType,
}) {
  return (dispatch, getState, { fetchClient } = {}) => {
    const promise = getAsyncData({
      resource,
      id,
      opts,
      actionType,
      state: getState(),
      fetchClient,
    });
    dispatch({
      type: types[`${actionType}_STARTED`], resource, id, opts, promise,
    });
    dispatch(waitAndDispatchFinished(promise, {
      type: actionType, resource, id, opts,
    }));

    return promise;
  };
}
