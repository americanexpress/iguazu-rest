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
  loadResource,
  loadCollection,
  createResource,
  updateResource,
  updateCollection,
  destroyResource,
  patchResource,
} from './actions/crud';

import {
  queryResource,
  queryCollection,
} from './actions/query';

import {
  getResource,
  getResourceIsLoaded,
  getCollection,
  getCollectionIsLoaded,
} from './selectors';

import {
  clearResource,
  clearCollection,
} from './actions/clear';

import resourcesReducer from './reducer';

import { configureIguazuREST } from './config';

/* Public API */
export {
  loadResource,
  loadCollection,
  createResource,
  updateResource,
  updateCollection,
  patchResource,
  destroyResource,
  queryResource,
  queryCollection,
  getResource,
  getResourceIsLoaded,
  getCollection,
  getCollectionIsLoaded,
  clearResource,
  clearCollection,
  resourcesReducer,
  configureIguazuREST,
};
