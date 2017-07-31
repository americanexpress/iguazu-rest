import hash from 'object-hash';
import { Map as iMap } from 'immutable';

export function valuesAsStrings(obj) {
  return iMap(obj).map(v => v.toString()).toJS();
}

export function convertId(originalId) {
  const idAsObj = typeof originalId === 'object' ? originalId : { id: originalId };
  const convertedId = valuesAsStrings(idAsObj);
  return convertedId;
}

export function getResourceIdHash(originalId) {
  const idObj = convertId(originalId);
  return hash(idObj.id);
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
