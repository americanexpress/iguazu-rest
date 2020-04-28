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

import { buildFetchUrl } from '../../src/helpers/url';

describe('buildFetchUrl', () => {
  it('should handle a simple url with one id provided', () => {
    const baseUrl = 'http://api.domain.com/users/:id';
    const url = buildFetchUrl({ url: baseUrl, id: '123' });
    expect(url).toBe('http://api.domain.com/users/123');
  });

  it('should handle a simple url with one id that is not provided', () => {
    const baseUrl = 'http://api.domain.com/users/:id';
    const url = buildFetchUrl({ url: baseUrl });
    expect(url).toBe('http://api.domain.com/users');
  });

  it('should handle a nested url with all ids provided', () => {
    const baseUrl = 'http://api.domain.com/users/:userId/posts/:postId';
    const url = buildFetchUrl({ url: baseUrl, id: { userId: '123', postId: 'abc' } });
    expect(url).toBe('http://api.domain.com/users/123/posts/abc');
  });

  it('should handle a nested url with some ids provided', () => {
    const baseUrl = 'http://api.domain.com/users/:userId/posts/:postId';
    const url = buildFetchUrl({ url: baseUrl, id: { userId: '123' } });
    expect(url).toBe('http://api.domain.com/users/123/posts');
  });

  it('should handle accidentally passing more ids than necessary', () => {
    const baseUrl = 'http://api.domain.com/users/:userId/posts/:postId';
    const url = buildFetchUrl({ url: baseUrl, id: { userId: '123', someId: 'huh' } });
    expect(url).toBe('http://api.domain.com/users/123/posts');
  });

  it('should handle empty optional ids by removing extra forward slashes or question marks', () => {
    const baseUrl = 'http://api.domain.com/users/:userId?/posts/:postId';
    const url = buildFetchUrl({ url: baseUrl, id: { someId: 'huh' } });
    expect(url).toBe('http://api.domain.com/users/posts');
  });

  it('should handle non-empty optional ids', () => {
    const baseUrl = 'http://api.domain.com/users/:userId?/posts/:postId';
    const url = buildFetchUrl({ url: baseUrl, id: { userId: '123', someId: 'huh' } });
    expect(url).toBe('http://api.domain.com/users/123/posts');
  });

  it('omits `:user?` when id field is not passed', () => {
    const baseUrl = 'http://api.domain.com/users/:user?/comments';
    const url = buildFetchUrl({
      url: baseUrl,
      opts: {
        query: { someModifier: 'questionable?' },
      },
    });
    expect(url).toBe('http://api.domain.com/users/comments?someModifier=questionable?');
  });

  it('should add query params', () => {
    const baseUrl = 'http://api.domain.com/users/:userId';
    const url = buildFetchUrl({
      url: baseUrl,
      opts: {
        query: {
          a: 'b',
          x: 'y',
        },
      },
    });
    expect(url).toBe('http://api.domain.com/users?a=b&x=y');
  });

  it('should replace query params with the correct value', () => {
    const baseUrl = 'http://api.domain.com/users/:userId?a=y&x=b';
    const url = buildFetchUrl({
      url: baseUrl,
      opts: {
        query: {
          a: 'b',
          x: 'y',
        },
      },
    });
    expect(url).toBe('http://api.domain.com/users?a=b&x=y');
  });

  it('should handle id params as query params', () => {
    const baseUrl = 'http://api.domain.com/users?userId=:id';
    const url = buildFetchUrl({
      url: baseUrl,
      id: '123',
    });
    expect(url).toBe('http://api.domain.com/users?userId=123');
  });
});
