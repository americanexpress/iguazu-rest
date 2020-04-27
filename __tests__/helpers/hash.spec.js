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

import { getResourceIdHash, getCollectionIdHash, getQueryHash } from '../../src/helpers/hash';
import { ID_TYPE_ERROR } from '../../src/errors';

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

    describe('when type of id is invalid', () => {
      it('should throw an error when the id is null', () => {
        expect(() => getResourceIdHash(null)).toThrowError(
          new Error(ID_TYPE_ERROR)
        );
      });
      it('should throw an error when the id is undefined', () => {
        expect(() => getResourceIdHash(undefined)).toThrowError(
          new Error(ID_TYPE_ERROR)
        );
      });
      it('should throw an error when the id is a boolean', () => {
        expect(() => getResourceIdHash(false)).toThrowError(
          new Error(ID_TYPE_ERROR)
        );
      });
      it('should throw an error when the id is a function', () => {
        expect(() => getResourceIdHash(() => '42')).toThrowError(
          new Error(ID_TYPE_ERROR)
        );
      });
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

    describe('when type of id is invalid', () => {
      it('should throw an error when the id is a boolean and true', () => {
        expect(() => getCollectionIdHash(true)).toThrowError(
          new Error(ID_TYPE_ERROR)
        );
      });
      it('should throw an error when the id is a function', () => {
        expect(() => getCollectionIdHash(() => '42')).toThrowError(
          new Error(ID_TYPE_ERROR)
        );
      });
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
