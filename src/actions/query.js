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

import {
  getResource,
  getCollection,
  getResourceIsLoaded,
  getCollectionIsLoaded,
} from '../selectors';
import {
  loadResource,
  loadCollection,
} from './crud';
import {
  handleQueryPromiseRejection,
} from './asyncSideEffects';

export function queryResource({
  resource, id, opts, forceFetch,
}) {
  return (dispatch, getState) => {
    const state = getState();
    const data = getResource({ resource, id, opts })(state);
    const status = getResourceIsLoaded({ resource, id, opts })(state) && !forceFetch ? 'complete' : 'loading';
    const error = data instanceof Error && data;
    const promise = dispatch(loadResource({
      resource, id, opts, forceFetch,
    }));
    handleQueryPromiseRejection(promise);

    return {
      data, status, error, promise,
    };
  };
}

export function queryCollection({
  resource, id, opts, forceFetch,
}) {
  return (dispatch, getState) => {
    const state = getState();
    const data = getCollection({ resource, id, opts })(state);
    const status = getCollectionIsLoaded({ resource, id, opts })(state) && !forceFetch ? 'complete' : 'loading';
    const error = data instanceof Error && data;
    const promise = dispatch(loadCollection({
      resource, id, opts, forceFetch,
    }));
    handleQueryPromiseRejection(promise);

    return {
      data, status, error, promise,
    };
  };
}
