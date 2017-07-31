import hash from 'object-hash';

export function getIdHash(id = {}) {
  return hash(typeof id === 'object' ? id : { id });
}

export function getQueryHash(opts = {}) {
  return hash(opts.query || {});
}
