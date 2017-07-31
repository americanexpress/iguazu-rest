import { getResourceIdHash, getCollectionIdHash, getQueryHash } from '../../src/helpers/hash';

describe('hash helpers', () => {
  describe('getResourceIdHash', () => {
    it('should consistently return the same hash for the same id string', () => {
      expect(getResourceIdHash('abc123')).toEqual(getResourceIdHash('abc123'));
    });

    it('should consistently return the same hash for the same id object', () => {
      expect(getResourceIdHash({ id: 'abc123', nestedId: 'xyz789' }))
        .toEqual(getResourceIdHash({ nestedId: 'xyz789', id: 'abc123' }));
    });

    it('should return the same hash if you send in the id as a string or an object', () => {
      expect(getResourceIdHash('123')).toEqual(getResourceIdHash({ id: '123' }));
    });

    it('should return the same hash if you send in the id value as a string or a number', () => {
      expect(getResourceIdHash(123)).toEqual(getResourceIdHash('123'));
      expect(getResourceIdHash({ id: 123 })).toEqual(getResourceIdHash({ id: '123' }));
    });
  });

  describe('getCollectionIdHash', () => {
    it('should return the same hash for a simple collection', () => {
      expect(getCollectionIdHash()).toEqual(getCollectionIdHash());
    });

    it('should return the same hash for a nested collection', () => {
      expect(getCollectionIdHash({ nestedId: 'xyz789' }))
        .toEqual(getCollectionIdHash({ nestedId: 'xyz789' }));
    });

    it('should return the same hash for resources that belong to the same collection', () => {
      expect(getCollectionIdHash({ id: 'abc123', nestedId: 'xyz789' }))
        .toEqual(getCollectionIdHash({ nestedId: 'xyz789', id: 'lmnop456' }));
      expect(getCollectionIdHash('abc123')).toEqual(getCollectionIdHash({ id: 'lmnop456' }));
    });
  });

  describe('getQueryHash', () => {
    it('should handle empty opts', () => {
      expect(getQueryHash()).toEqual(getQueryHash());
    });

    it('should handle empty query', () => {
      expect(getQueryHash({})).toEqual(getQueryHash({}));
      expect(getQueryHash({})).toEqual(getQueryHash());
    });

    it('should support a populated query object', () => {
      expect(getQueryHash({ query: { some: 'query' } }))
        .toEqual(getQueryHash({ query: { some: 'query' } }));
    });
  });
});
