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

import { Map as iMap } from 'immutable';

import config from './config';
import {
  getResourceIdHash,
  getCollectionIdHash,
  getQueryHash,
} from './helpers/hash';

export function resourceIsLoaded({ resource, id }) {
  return (state) => {
    const resourceState = config.getToState(state).get(resource, iMap());
    const idHash = getResourceIdHash(id);
    return !!resourceState.getIn(['items', idHash]) || !!resourceState.getIn(['error', idHash]);
  };
}

export function getResource({ resource, id }) {
  return (state) => {
    const resourceState = config.getToState(state).get(resource, iMap());
    const error = resourceState.getIn(['error', getResourceIdHash(id)]);
    if (error) return error;

    const item = resourceState.getIn(['items', getResourceIdHash(id)]);
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
    const error = resourceState.getIn(['collections', idHash, queryHash, 'error']);
    if (error) return error;

    const { associatedIds } =
      resourceState.getIn(['collections', idHash, queryHash], iMap({ associatedIds: [] })).toJS();

    return associatedIds.map(resourceId => resourceState.getIn(['items', resourceId]).toJS());
  };
}

export function collectionIsLoading({ resource, id, opts }) {
  return state => !!config.getToState(state).getIn([resource, 'loading', getCollectionIdHash(id), getQueryHash(opts)]);
}

export function getCollectionLoadPromise({ resource, id, opts }) {
  return state => config.getToState(state).getIn([resource, 'loading', getCollectionIdHash(id), getQueryHash(opts)]);
}
