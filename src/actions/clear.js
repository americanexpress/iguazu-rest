import { CLEAR_COLLECTION, CLEAR_RESOURCE } from '../types';

export function clearResource({ resource, id }) {
  return { resource, id, type: CLEAR_RESOURCE };
}

export function clearCollection({ resource, id, opts }) {
  return { resource, id, opts, type: CLEAR_COLLECTION };
}
