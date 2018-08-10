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

// https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js#L473

const PROTOCOL_AND_DOMAIN_REGEX = /^https?:\/\/[^/]*/;
const NUMBER_REGEX = /^\\d+$/;
// const isString = string => typeof string === 'string';

/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a
 * custom method because encodeURIComponent is too aggressive and encodes stuff that doesn't
 * have to be encoded per http://tools.ietf.org/html/rfc3986
 */
export const encodeUriQuery = val =>
  encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',');

/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set
 * (pchar) allowed in path segments
 */
export const encodeUriSegment = val =>
  encodeUriQuery(val)
    .replace(/%26/gi, '&')
    .replace(/%3D/gi, '=')
    .replace(/%2B/gi, '+');

export const parseUrlParams = url =>
  url.split(/\W/).reduce((urlParams, param) => {
    if (!NUMBER_REGEX.test(param) && param && (new RegExp(`(^|[^\\\\]):${param}(\\W|$)`).test(url))) {
      urlParams[param] = { // eslint-disable-line no-param-reassign
        isQueryParamValue: (new RegExp(`\\?.*=:${param}(?:\\W|$)`)).test(url),
      };
    }
    return urlParams;
  }, {});

export const replaceUrlParamFromUrl = (url, urlParam, replace = '') =>
  url.replace(new RegExp(`(/?):${urlParam}(\\W|$)`, 'g'), (match, leadingSlashes, tail) =>
    (replace || tail.charAt(0) === '/' ? leadingSlashes : '') + replace + tail
  );

export const replaceQueryStringParamFromUrl = (url, key, value) => {
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const sep = url.indexOf('?') !== -1 ? '&' : '?';
  return url.match(re)
    ? url.replace(re, `$1${key}=${value}$2`)
    : `${url}${sep}${key}=${value}`;
};

export const splitUrlByProtocolAndDomain = (url) => {
  let protocolAndDomain;
  const remainderUrl = url.replace(PROTOCOL_AND_DOMAIN_REGEX, (match) => {
    protocolAndDomain = match;
    return '';
  });
  return [protocolAndDomain, remainderUrl];
};

const isObject = maybeObject =>
  typeof maybeObject === 'object';


export function addQueryParams({ url, opts = {} }) {
  return Object.keys(opts.query || []).reduce((wipUrl, queryParam) => {
    const queryParamValue = opts.query[queryParam];
    return replaceQueryStringParamFromUrl(wipUrl, queryParam, queryParamValue);
  }, url);
}

export function replaceUrlParams({ url, id }) {
  // Replace urlParams with values from context
  const urlParams = parseUrlParams(url);

  return Object.keys(urlParams).reduce((wipUrl, urlParam) => {
    const urlParamInfo = urlParams[urlParam];
    const idAsObject = !isObject(id) ? { id } : id;
    const value = idAsObject[urlParam] || '';
    if (value) {
      const encodedValue = urlParamInfo.isQueryParamValue ?
        encodeUriQuery(value) : encodeUriSegment(value);
      return replaceUrlParamFromUrl(wipUrl, urlParam, encodedValue);
    }
    return replaceUrlParamFromUrl(wipUrl, urlParam);
  }, url)
  .replace(/\/+$/, ''); // strip trailing slashes
}

export function buildFetchUrl({ url, id, opts }) {
  const [protocolAndDomain, remainderUrl] = splitUrlByProtocolAndDomain(url);

  let builtUrl = replaceUrlParams({ url: remainderUrl, id });
  builtUrl = addQueryParams({ url: builtUrl, opts });

  return protocolAndDomain + builtUrl;
}
