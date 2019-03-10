import { CLEAR_COLLECTION, CLEAR_RESOURCE } from '../../src/types';
import { clearCollection, clearResource } from '../../src';

describe('clearing', () => {
  it('resource', () => {
    expect(clearResource({ resource: 'users', id: 234 }))
      .toEqual({ type: CLEAR_RESOURCE, id: 234, resource: 'users' });
  });

  it('collection', () => {
    expect(clearCollection({ resource: 'users', opts: { query: 'some&query' } }))
      .toEqual({ type: CLEAR_COLLECTION, resource: 'users', opts: { query: 'some&query' } });
  });
});
