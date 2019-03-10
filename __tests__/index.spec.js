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
  destroyResource,
  queryResource,
  queryCollection,
  getResource,
  getCollection,
  clearResource,
  clearCollection,
  resourcesReducer,
  configureIguazuREST,
} from '../src/index';

describe('index', () => {
  it('should expose the expected publicAPI', () => {
    expect(loadResource).toBeDefined();
    expect(loadCollection).toBeDefined();
    expect(createResource).toBeDefined();
    expect(updateResource).toBeDefined();
    expect(destroyResource).toBeDefined();
    expect(queryResource).toBeDefined();
    expect(queryCollection).toBeDefined();
    expect(getResource).toBeDefined();
    expect(getCollection).toBeDefined();
    expect(clearResource).toBeDefined();
    expect(clearCollection).toBeDefined();

    expect(resourcesReducer).toBeDefined();
    expect(configureIguazuREST).toBeDefined();
  });
});
