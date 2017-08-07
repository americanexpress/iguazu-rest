import {
  loadResource,
  loadCollection,
  createResource,
  updateResource,
  destroyResource,
} from './actions/crud';

import {
  queryResource,
  queryCollection,
} from './actions/query';

import {
  getResource,
  getCollection,
} from './selectors';

import resourcesReducer from './reducer';

import config from './config';

/* Public API */
export {
  loadResource,
  loadCollection,
  createResource,
  updateResource,
  destroyResource,
  queryResource,
  queryCollection,
  getResource,
  getCollection,
  resourcesReducer,
  config,
};
