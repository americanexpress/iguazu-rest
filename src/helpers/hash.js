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

import hash from 'object-hash';
import { Map as iMap } from 'immutable';
import { ID_TYPE_ERROR } from '../errors';

export function valuesAsStrings(obj) {
  return iMap(obj).map(v => v.toString()).toJS();
}

function getIdAsObject(id) {
  const idType = typeof id;
  if (idType === 'object' && id !== null) {
    return id;
  }
  if (idType === 'string' || idType === 'number') {
    return { id };
  }
  throw new Error(ID_TYPE_ERROR);
}

export function convertId(originalId) {
  return valuesAsStrings(getIdAsObject(originalId));
}

export function getResourceIdHash(originalId) {
  const idObj = convertId(originalId);
  return hash(idObj);
}

export function getCollectionIdHash(id) {
  if (id) {
    const idObj = convertId(id);
    delete idObj.id;
    return hash(idObj);
  }

  return hash({});
}

export function getQueryHash(opts = {}) {
  return hash(opts.query || {});
}
